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
        body: 'Your home base for job search automations, stats, and quick actions.',
        target: 'tour-dashboard',
        icon: 'dashboard',
        tips: ['Activity summary at a glance', 'Jump to chat or results in one click'],
      },
      {
        title: 'Job search chat',
        body: 'Describe the role, skills, and location in plain language — the agent handles the rest.',
        target: 'tour-chat',
        icon: 'chat',
        tips: ['No website URL required', 'Listings appear right in the thread'],
      },
      {
        title: 'Results & history',
        body: 'Saved job tables live under Results; full chat transcripts under History.',
        target: 'tour-results',
        icon: 'results',
        tips: ['Export-friendly job rows', 'Reopen past conversations anytime'],
      },
      {
        title: 'You are all set',
        body: 'Update your profile preferences anytime, then start your first search.',
        target: 'tour-finish',
        icon: 'finish',
        tips: ['Use the dock below to move around', 'Toggle light or dark mode when you like'],
      },
    ];
  }

  adminSteps(): OnboardingStep[] {
    return [
      {
        title: 'Admin dashboard',
        body: 'Platform-wide stats — users, tasks, and activity — from one screen.',
        target: 'tour-dashboard',
        icon: 'dashboard',
        tips: ['Total users and automations', 'Same quick actions as members'],
      },
      {
        title: 'User management',
        body: 'Review accounts, roles, onboarding status, and activate or deactivate access.',
        target: 'tour-users',
        icon: 'users',
        tips: ['See who completed onboarding', 'Control login access safely'],
      },
      {
        title: 'Automation chat',
        body: 'Run job searches exactly as end users do to verify flows and results.',
        target: 'tour-chat',
        icon: 'chat',
        tips: ['Test natural-language queries', 'Inspect listings in the dock'],
      },
      {
        title: 'Admin ready',
        body: 'You are set to manage users and monitor automation activity.',
        target: 'tour-finish',
        icon: 'finish',
        tips: ['Dock navigation stays at the bottom', 'Results and History for audits'],
      },
    ];
  }

  completeOnServer(): Observable<User> {
    return this.auth.completeOnboarding();
  }
}
