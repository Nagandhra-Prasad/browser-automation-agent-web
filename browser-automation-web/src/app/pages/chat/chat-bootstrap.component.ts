import { Component, inject, OnInit } from '@angular/core';

import { ChatNavigationService } from '../../core/chat-navigation.service';

/** `/app/chat` — creates a conversation and redirects to `/c/<uuid>`. */
@Component({
  selector: 'app-chat-bootstrap',
  standalone: true,
  template: '<p class="hint">Starting a new chat…</p>',
  styles: `
    .hint {
      padding: 1.5rem;
      color: var(--text-muted);
    }
  `,
})
export class ChatBootstrapComponent implements OnInit {
  private readonly chatNav = inject(ChatNavigationService);

  ngOnInit(): void {
    this.chatNav.openNewJobSearchChat();
  }
}
