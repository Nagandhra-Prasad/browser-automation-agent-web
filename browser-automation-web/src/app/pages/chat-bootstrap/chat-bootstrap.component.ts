import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { conversationChatPath } from '../../core/conversation-routes';
import { ConversationStore } from '../../core/conversation.store';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-chat-bootstrap',
  standalone: true,
  template: `
    <div class="bootstrap">
      <div class="spinner" aria-hidden="true"></div>
      <p>Starting a new conversation…</p>
    </div>
  `,
  styles: [
    `
      .bootstrap {
        display: grid;
        place-items: center;
        gap: 1rem;
        min-height: 40vh;
        color: var(--text-muted);
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class ChatBootstrapComponent implements OnInit {
  private readonly agent = inject(AgentService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    ConversationStore.clear();
    this.agent.createConversation().subscribe({
      next: (conversation) => {
        ConversationStore.setId(conversation.id);
        void this.router.navigateByUrl(conversationChatPath(conversation.id));
      },
      error: () => {
        void this.router.navigate(['/app/dashboard']);
      },
    });
  }
}
