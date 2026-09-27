const LOCALE = 'en-GB';

/** 14 Mar 2026 */
export const formatDate = (d: Date) =>
  d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** Mar 2026 */
export const formatMonth = (d: Date) => d.toLocaleDateString(LOCALE, { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2026-03" → Mar 2026 */
export const formatYearMonth = (ym: string) => formatMonth(new Date(`${ym}-01T00:00:00Z`));

/** ISO date for <time datetime> */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** 1234 → 1.2k */
export const compactNumber = (n: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
