import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BreadcrumbService } from '../../core/breadcrumb.service';
import { SessionService } from '../../core/session.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-page-topbar',
  standalone: true,
  imports: [RouterLink, UserAvatarComponent],
  templateUrl: './page-topbar.component.html',
  styleUrl: './page-topbar.component.scss',
})
export class PageTopbarComponent implements OnInit, OnDestroy {
  protected readonly breadcrumbs = inject(BreadcrumbService);
  protected readonly session = inject(SessionService);

  private clockTimer?: ReturnType<typeof setInterval>;
  clockTime = '';
  clockDate = '';

  ngOnInit(): void {
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  private tickClock(): void {
    const now = new Date();
    const locale = navigator.language;
    this.clockTime = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);
    this.clockDate = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(now);
  }
}
