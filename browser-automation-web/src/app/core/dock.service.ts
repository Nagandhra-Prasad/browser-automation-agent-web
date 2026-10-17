import { Injectable, signal } from '@angular/core';

import { JobListing } from '../models/api.models';

export interface DockView {
  title: string;
  subtitle?: string;
  sourceWebsite?: string | null;
  jobs: JobListing[];
  focusJob?: JobListing;
}

@Injectable({ providedIn: 'root' })
export class DockService {
  readonly open = signal(false);
  readonly view = signal<DockView | null>(null);

  openJob(job: JobListing, context?: { sourceWebsite?: string | null }): void {
    this.view.set({
      title: job.title,
      subtitle: job.company,
      sourceWebsite: context?.sourceWebsite ?? null,
      jobs: [job],
      focusJob: job,
    });
    this.open.set(true);
  }

  openJobs(
    jobs: JobListing[],
    options?: { title?: string; subtitle?: string; sourceWebsite?: string | null },
  ): void {
    if (!jobs.length) {
      return;
    }
    this.view.set({
      title: options?.title ?? 'Search results',
      subtitle: options?.subtitle ?? `${jobs.length} job listing${jobs.length === 1 ? '' : 's'}`,
      sourceWebsite: options?.sourceWebsite ?? null,
      jobs,
    });
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }
}
