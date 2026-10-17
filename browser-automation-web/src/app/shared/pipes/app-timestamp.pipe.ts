import { Pipe, PipeTransform } from '@angular/core';

import { parseAppTimestamp } from './parse-app-timestamp';

export type AppTimestampFormat = 'datetime' | 'date' | 'time';

@Pipe({
  name: 'appTimestamp',
  standalone: true,
})
export class AppTimestampPipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    format: AppTimestampFormat = 'datetime',
  ): string {
    const date = parseAppTimestamp(value);
    if (!date) {
      return '—';
    }

    const locale = navigator.language;
    switch (format) {
      case 'date':
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
      case 'time':
        return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(date);
      case 'datetime':
      default:
        return new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
    }
  }
}
