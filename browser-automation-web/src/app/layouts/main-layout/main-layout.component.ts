import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { BreadcrumbService } from '../../core/breadcrumb.service';
import { SessionService } from '../../core/session.service';
import { ThemeService } from '../../core/theme.service';
import { OnboardingTourComponent } from '../../shared/onboarding-tour/onboarding-tour.component';
import { PageTopbarComponent } from '../../shared/page-topbar/page-topbar.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { AuthService } from '../../services/auth.service';
import { OnboardingService } from '../../services/onboarding.service';
import { NEW_CHAT_PATH } from '../../core/conversation-routes';
import { OnboardingStep } from '../../models/api.models';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    OnboardingTourComponent,
    PageTopbarComponent,
    UserAvatarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly onboarding = inject(OnboardingService);
  private readonly router = inject(Router);
  protected readonly theme = inject(ThemeService);
  private readonly _breadcrumbs = inject(BreadcrumbService);

  user = this.session.user;
  showTour = false;
  tourSteps: OnboardingStep[] = [];
  readonly chatNavActive = signal(false);

  ngOnInit(): void {
    this.updateChatNavActive(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.updateChatNavActive(e.urlAfterRedirects);
    });

    this.auth.me().subscribe({
      next: (user) => {
        this.user = user;
        if (!user.onboarding_completed) {
          this.tourSteps =
            user.role === 'admin' ? this.onboarding.adminSteps() : this.onboarding.userSteps();
          this.showTour = true;
        }
      },
      error: () => this.logout(),
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private updateChatNavActive(url: string): void {
    const path = url.split('?')[0];
    this.chatNavActive.set(path.startsWith('/c/'));
  }

  onTourFinished(): void {
    this.showTour = false;
    this.onboarding.completeOnServer().subscribe({
      next: (user) => {
        this.user = user;
      },
    });
  }
}
