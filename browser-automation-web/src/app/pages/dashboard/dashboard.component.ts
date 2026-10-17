import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../../core/session.service';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { DashboardSummary } from '../../models/api.models';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, UserAvatarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboard = inject(DashboardService);
  private readonly session = inject(SessionService);

  user = this.session.user;
  summary: DashboardSummary | null = null;
  loading = true;

  ngOnInit(): void {
    this.dashboard.summary().subscribe({
      next: (s) => {
        this.summary = s;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
