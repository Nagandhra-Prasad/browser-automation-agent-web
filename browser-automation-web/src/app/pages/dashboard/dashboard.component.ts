import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../../core/session.service';
import { DashboardSummary } from '../../models/api.models';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
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

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'morning';
    }
    if (hour < 17) {
      return 'afternoon';
    }
    return 'evening';
  }

  get firstName(): string {
    const name = this.user?.name?.trim();
    if (!name) {
      return 'there';
    }
    return name.split(/\s+/)[0];
  }
}
