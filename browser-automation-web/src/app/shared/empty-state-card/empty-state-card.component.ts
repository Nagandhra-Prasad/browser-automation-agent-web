import { Component, input } from '@angular/core';

export type EmptyStateIcon = 'chat' | 'inbox' | 'results' | 'history' | 'users' | 'search' | 'jobs';

@Component({
  selector: 'app-empty-state-card',
  standalone: true,
  host: {
    '[class.empty-state-host--fill]': 'fill()',
  },
  templateUrl: './empty-state-card.component.html',
  styleUrl: './empty-state-card.component.scss',
})
export class EmptyStateCardComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly icon = input<EmptyStateIcon>('inbox');
  readonly compact = input(false);
  readonly fill = input(false);
}
