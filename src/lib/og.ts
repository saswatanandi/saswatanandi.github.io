/**
 * Per-page social cards (Open Graph images): where they live.
 * The JPEGs are drawn at build time by src/pages/og/[...slug].png.ts (see src/lib/og-card.ts).
 */
export type OgSection = 'blog' | 'reading' | 'software' | 'publications';

/** Site-relative URL of a page's share card, e.g. /og/blog/cdo-install.jpg */
export const ogCardPath = (section: OgSection, id: string): string => `/og/${section}/${id}.jpg`;
