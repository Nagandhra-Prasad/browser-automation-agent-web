import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SessionService } from '../../core/session.service';
import { Conversation, StoredMessage } from '../../models/api.models';
import { AgentService } from '../../services/agent.service';
import { EmptyStateCardComponent } from '../../shared/empty-state-card/empty-state-card.component';
import { AppTimestampPipe } from '../../shared/pipes/app-timestamp.pipe';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [AppTimestampPipe, NgClass, RouterLink, EmptyStateCardComponent],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss',
})
export class ConversationsComponent implements OnInit {
  private readonly agent = inject(AgentService);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);

  conversations: Conversation[] = [];
  messages: StoredMessage[] = [];
  selectedId: string | null = null;
  loadingList = true;
  loadingMessages = false;
  error = '';
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.session.isAdmin();
    this.agent.listConversations().subscribe({
      next: (list) => {
        this.conversations = list;
        this.loadingList = false;
        const q = this.route.snapshot.queryParamMap.get('id');
        if (q) {
          this.openConversation(q);
        } else if (list.length) {
          this.openConversation(list[0].id);
        }
      },
      error: (err) => {
        this.error = err.error?.detail ?? 'Failed to load conversations';
        this.loadingList = false;
      },
    });
  }

  openConversation(id: string): void {
    this.selectedId = id;
    this.loadingMessages = true;
    this.agent.getConversation(id).subscribe({
      next: (detail) => {
        this.messages = detail.messages;
        this.loadingMessages = false;
      },
      error: () => {
        this.loadingMessages = false;
        this.messages = [];
      },
    });
  }

}
