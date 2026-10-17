import { NgClass } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatNavigationService } from '../../core/chat-navigation.service';
import { conversationCommands, isValidConversationId } from '../../core/conversation-routes';
import { DockService } from '../../core/dock.service';
import { SessionService } from '../../core/session.service';
import { ChatMessage, ChatResponse, JobListing, StoredMessage } from '../../models/api.models';
import { AgentService } from '../../services/agent.service';
import { AuthService } from '../../services/auth.service';
import { AppTimestampPipe } from '../../shared/pipes/app-timestamp.pipe';
import { parseAppTimestamp } from '../../shared/pipes/parse-app-timestamp';
import { ResultDockComponent } from '../../shared/result-dock/result-dock.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, AppTimestampPipe, ResultDockComponent, UserAvatarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private readonly agent = inject(AgentService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly dock = inject(DockService);
  protected readonly session = inject(SessionService);
  private readonly chatNav = inject(ChatNavigationService);

  @ViewChild('messagesViewport') messagesViewport?: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  latestJobs: JobListing[] = [];
  latestSource: string | null = null;
  conversationId: string | null = null;
  loading = false;
  loadingHistory = true;
  agentStatusText: string | null = null;

  private shouldScrollToBottom = true;
  private scrollSmooth = false;
  private skipNextRouteLoad = false;

  form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    this.auth.me().subscribe({ error: () => {} });
    this.route.paramMap.subscribe((params) => {
      const routeId = params.get('conversationId');
      const legacyQueryId = this.route.snapshot.queryParamMap.get('conversation');
      const conversationId = routeId ?? legacyQueryId;

      if (legacyQueryId && !routeId) {
        if (isValidConversationId(legacyQueryId)) {
          void this.router.navigate(conversationCommands(legacyQueryId), { replaceUrl: true });
        } else {
          this.chatNav.openNewJobSearchChat();
        }
        return;
      }

      if (!conversationId) {
        void this.router.navigate(['/app/dashboard'], { replaceUrl: true });
        return;
      }

      if (!isValidConversationId(conversationId)) {
        this.chatNav.openNewJobSearchChat();
        return;
      }

      if (this.skipNextRouteLoad && this.conversationId === conversationId) {
        this.skipNextRouteLoad = false;
        return;
      }

      this.loadConversation(conversationId);
    });
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) {
      return;
    }
    this.scrollToBottom(this.scrollSmooth);
    this.shouldScrollToBottom = false;
    this.scrollSmooth = false;
  }

  newChat(): void {
    this.chatNav.openNewJobSearchChat();
  }

  send(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const { message } = this.form.getRawValue();
    this.messages.push({ role: 'user', content: message, createdAt: new Date() });
    this.form.patchValue({ message: '' });
    this.queueScrollToBottom(true);

    const isLikelyJobSearch = this.looksLikeJobSearch(message);
    this.agentStatusText = isLikelyJobSearch
      ? 'Searching job sites and extracting listings…'
      : 'Agent is thinking…';
    this.loading = true;

    this.agent
      .sendMessage({
        message,
        conversation_id: this.conversationId ?? undefined,
        headless: true,
      })
      .subscribe({
        next: (res) => {
          this.conversationId = res.conversation_id;
          this.loading = false;
          this.agentStatusText = null;
          this.revealAgentMessage(res.reply, res);
        },
        error: (err) => {
          this.loading = false;
          this.agentStatusText = null;
          const detail =
            err.error?.detail ?? 'Request failed. Is the API running on port 8000?';
          this.revealAgentMessage(detail);
        },
      });
  }

  openJobInDock(job: JobListing, sourceWebsite?: string | null): void {
    this.dock.openJob(job, { sourceWebsite: sourceWebsite ?? this.latestSource });
  }

  openAllJobsInDock(jobs: JobListing[], sourceWebsite?: string | null): void {
    this.dock.openJobs(jobs, {
      title: 'Job search results',
      subtitle: `${jobs.length} listings from your latest search`,
      sourceWebsite: sourceWebsite ?? this.latestSource,
    });
  }

  jobsForMessage(msg: ChatMessage): JobListing[] {
    return msg.meta?.jobs ?? [];
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private queueScrollToBottom(smooth = false): void {
    this.shouldScrollToBottom = true;
    if (smooth) {
      this.scrollSmooth = true;
    }
  }

  private scrollToBottom(smooth: boolean): void {
    const el = this.messagesViewport?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  private loadConversation(conversationId: string): void {
    if (
      this.conversationId === conversationId &&
      this.messages.length > 0 &&
      !this.loading
    ) {
      this.loadingHistory = false;
      return;
    }

    this.loadingHistory = true;
    this.agent.getConversation(conversationId).subscribe({
      next: (detail) => {
        this.conversationId = detail.conversation.id;
        const restored = detail.messages.map((m) => this.fromStoredMessage(m));
        this.messages = restored.length ? restored : [this.welcomeMessage()];
        const latest = this.extractLatestJobs(detail.messages);
        this.latestJobs = latest.jobs;
        this.latestSource = latest.source;
        this.loadingHistory = false;
        this.queueScrollToBottom();
      },
      error: () => {
        this.loadingHistory = false;
        void this.router.navigate(['/app/dashboard'], { replaceUrl: true });
      },
    });
  }

  private fromStoredMessage(m: StoredMessage): ChatMessage {
    const meta = m.metadata ? (m.metadata as unknown as ChatResponse) : undefined;
    return {
      role: m.role,
      content: m.content,
      meta: meta && m.role === 'agent' ? meta : undefined,
      createdAt: parseAppTimestamp(m.created_at) ?? new Date(),
    };
  }

  private extractLatestJobs(messages: StoredMessage[]): { jobs: JobListing[]; source: string | null } {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const meta = messages[i].metadata as unknown as ChatResponse | undefined;
      const jobs = meta?.jobs;
      if (jobs?.length) {
        return { jobs, source: meta?.source_website ?? null };
      }
    }
    return { jobs: [], source: null };
  }

  private welcomeMessage(): ChatMessage {
    return {
      role: 'agent',
      content:
        'Hello! Ask me for jobs in plain language — for example: "Find Java developer jobs in Chennai". ' +
        'Past chats are available under Conversations.',
      createdAt: new Date(),
    };
  }

  private revealAgentMessage(content: string, meta?: ChatResponse): void {
    this.appendAgentMessage(content, meta);
    this.queueScrollToBottom(true);
  }

  private appendAgentMessage(content: string, meta?: ChatResponse): void {
    this.messages.push({
      role: 'agent',
      content,
      meta,
      createdAt: new Date(),
    });
    if (meta?.jobs?.length) {
      this.latestJobs = meta.jobs;
      this.latestSource = meta.source_website;
    }
    if (this.conversationId) {
      this.syncConversationRoute(this.conversationId);
    }
  }

  private syncConversationRoute(conversationId: string): void {
    if (this.route.snapshot.paramMap.get('conversationId') === conversationId) {
      return;
    }
    this.skipNextRouteLoad = true;
    void this.router.navigate(conversationCommands(conversationId), { replaceUrl: true });
  }

  private looksLikeJobSearch(message: string): boolean {
    return /\b(job|jobs|developer|engineer|hiring|career|vacancy|opening)\b/i.test(message);
  }
}
