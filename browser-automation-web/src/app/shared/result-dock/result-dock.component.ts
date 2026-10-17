import { Component, inject, input } from '@angular/core';

import { DockService } from '../../core/dock.service';

@Component({
  selector: 'app-result-dock',
  standalone: true,
  host: {
    '[class.embedded]': 'embedded()',
  },
  templateUrl: './result-dock.component.html',
  styleUrl: './result-dock.component.scss',
})
export class ResultDockComponent {
  protected readonly dock = inject(DockService);
  readonly embedded = input(false);

  close(): void {
    this.dock.close();
  }

  onBackdropClick(): void {
    this.close();
  }

  isFocused(jobTitle: string, company: string): boolean {
    const focus = this.dock.view()?.focusJob;
    if (!focus) {
      return false;
    }
    return focus.title === jobTitle && focus.company === company;
  }
}
