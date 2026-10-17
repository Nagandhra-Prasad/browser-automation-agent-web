/** Parse API / stored timestamps as UTC when no offset is present, then use as local Date. */
export function parseAppTimestamp(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  let iso = trimmed;

  if (!hasTimezone && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    iso = trimmed.includes('T') ? `${trimmed}Z` : `${trimmed}T00:00:00Z`;
  }

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}
