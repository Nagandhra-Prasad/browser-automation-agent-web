import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { conversationCommands } from './conversation-routes';
import { AgentService } from '../services/agent.service';

@Injectable({ providedIn: 'root' })
export class ChatNavigationService {
  private readonly agent = inject(AgentService);
  private readonly router = inject(Router);
  private creating = false;

  openNewJobSearchChat(): void {
    if (this.creating) {
      return;
    }
    this.creating = true;
    this.agent
      .createConversation('Job search chat')
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: (conversation) => {
          void this.router.navigate(conversationCommands(conversation.id));
        },
        error: () => {
          void this.router.navigate(['/app/dashboard']);
        },
      });
  }
}
