import { Component, inject } from '@angular/core';
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
export class PageTopbarComponent {
  protected readonly breadcrumbs = inject(BreadcrumbService);
  protected readonly session = inject(SessionService);
}
