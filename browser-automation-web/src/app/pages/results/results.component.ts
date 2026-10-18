import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../../core/session.service';
import { JobListing, ResultTableRow } from '../../models/api.models';
import { ResultsService } from '../../services/results.service';
import { EmptyStateCardComponent } from '../../shared/empty-state-card/empty-state-card.component';
import { AppTimestampPipe } from '../../shared/pipes/app-timestamp.pipe';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [AppTimestampPipe, RouterLink, EmptyStateCardComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  private readonly resultsService = inject(ResultsService);
  private readonly session = inject(SessionService);

  rows: ResultTableRow[] = [];
  selected: ResultTableRow | null = null;
  loading = true;
  error = '';
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.session.isAdmin();
    this.resultsService.table().subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail ?? 'Failed to load results';
        this.loading = false;
      },
    });
  }

  selectRow(row: ResultTableRow): void {
    this.selected = this.selected?.id === row.id ? null : row;
  }

  jobsFor(row: ResultTableRow): JobListing[] {
    return row.jobs ?? [];
  }
}
