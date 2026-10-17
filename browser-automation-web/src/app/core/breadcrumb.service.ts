import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  readonly items = signal<BreadcrumbItem[]>(this.defaultCrumbs());

  private readonly routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    chat: 'Job search chat',
    results: 'Results',
    conversations: 'Conversations',
    users: 'User management',
    profile: 'Profile settings',
  };

  constructor(private readonly router: Router) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.items.set(this.build(this.router.url));
    });
    this.items.set(this.build(this.router.url));
  }

  private defaultCrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Home', path: '/app/dashboard' },
      { label: 'Dashboard' },
    ];
  }

  private build(url: string): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/app/dashboard' }];

    const segments = url.split('?')[0].split('/').filter(Boolean);

    if (segments[0] === 'c') {
      crumbs.push({ label: 'Dashboard', path: '/app/dashboard' });
      crumbs.push({ label: this.routeLabels['chat'] });
      return crumbs;
    }

    const appIndex = segments.indexOf('app');
    if (appIndex === -1) {
      crumbs.push({ label: 'Dashboard' });
      return crumbs;
    }

    const parts = segments.slice(appIndex + 1);
    const page = parts[0] ?? 'dashboard';

    if (page === 'dashboard') {
      crumbs.push({ label: 'Dashboard' });
      return crumbs;
    }

    crumbs.push({ label: 'Dashboard', path: '/app/dashboard' });
    crumbs.push({
      label: this.routeLabels[page] ?? this.titleCase(page),
    });

    return crumbs;
  }

  private titleCase(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
