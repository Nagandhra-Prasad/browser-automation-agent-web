import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../../core/session.service';
import { User } from '../../models/api.models';
import { EmptyStateCardComponent } from '../../shared/empty-state-card/empty-state-card.component';
import { AppTimestampPipe } from '../../shared/pipes/app-timestamp.pipe';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink, AppTimestampPipe, EmptyStateCardComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly session = inject(SessionService);

  users: User[] = [];
  loading = true;
  error = '';
  actionError = '';
  updatingId: string | null = null;

  ngOnInit(): void {
    this.usersService.list().subscribe({
      next: (rows) => {
        this.users = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail ?? 'Failed to load users';
        this.loading = false;
      },
    });
  }

  isSelf(user: User): boolean {
    return user.id === this.session.user?.id;
  }

  setActive(user: User, active: boolean): void {
    if (this.isSelf(user) && !active) {
      return;
    }
    this.actionError = '';
    this.updatingId = user.id;
    this.usersService.setActive(user.id, active).subscribe({
      next: (updated) => {
        this.users = this.users.map((row) => (row.id === updated.id ? updated : row));
        this.updatingId = null;
      },
      error: (err) => {
        this.actionError = err.error?.detail ?? 'Could not update user';
        this.updatingId = null;
      },
    });
  }
}
