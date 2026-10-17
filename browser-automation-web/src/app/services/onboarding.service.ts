import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { OnboardingStep, User } from '../models/api.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly auth = inject(AuthService);

  userSteps(): OnboardingStep[] {
    return [
      {
        title: 'Welcome to your dashboard',
        body: 'This is your home screen. See quick stats and jump to job search.',
        target: 'tour-dashboard',
      },
      {
        title: 'Job search chat',
        body: 'Open Chat and describe jobs in plain language — no website URL needed.',
        target: 'tour-chat',
      },
      {
        title: 'Results & history',
        body: 'Results stores job tables; Conversations shows full chat history after refresh.',
        target: 'tour-results',
      },
      {
        title: 'You are all set',
        body: 'Start searching for jobs whenever you are ready.',
        target: 'tour-finish',
      },
    ];
  }

  adminSteps(): OnboardingStep[] {
    return [
      {
        title: 'Admin dashboard',
        body: 'Monitor total users and automation tasks across the platform.',
        target: 'tour-dashboard',
      },
      {
        title: 'User management',
        body: 'Review registered users, roles, and onboarding status.',
        target: 'tour-users',
      },
      {
        title: 'Automation chat',
        body: 'Test job searches the same way end users do.',
        target: 'tour-chat',
      },
      {
        title: 'Admin ready',
        body: 'You can manage users and monitor activity from here.',
        target: 'tour-finish',
      },
    ];
  }

  completeOnServer(): Observable<User> {
    return this.auth.completeOnboarding();
  }
}
