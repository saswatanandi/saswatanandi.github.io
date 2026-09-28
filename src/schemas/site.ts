import { z } from 'astro/zod';

/** Empty strings in YAML mean "not set": normalise them to undefined. */
const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : undefined));

/** An optional absolute (https://) or site-relative (/path) URL. Empty → undefined. */
const optionalUrl = optionalText
  .transform((v) => (v === undefined ? v : addScheme(v)))
  .refine((v) => v === undefined || /^https?:\/\/[^\s]+\.[^\s]+$/.test(v) || v.startsWith('/'), {
    message: 'must be a web address like "https://example.org" (or a site path starting with /), or empty',
  });

/** `github.com/x` → `https://github.com/x`. Leaves full URLs and /paths alone. */
function addScheme(v: string): string {
  if (/^https?:\/\//i.test(v) || v.startsWith('/')) return v;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v)) return `https://${v}`;
  return v;
}

/**
 * A profile link that accepts a full URL, a URL without https://, or a bare handle / id.
 * `fromHandle` turns a bare value into a URL (or returns undefined if it doesn't look valid).
 */
function profileUrl(example: string, fromHandle: (v: string) => string | undefined) {
  return optionalText.transform((v, ctx) => {
    if (v === undefined) return v;
    const handle = fromHandle(v);
    if (handle) return handle;
    const url = addScheme(v);
    if (/^https?:\/\/[^\s]+\.[^\s]+$/.test(url)) return url;
    ctx.addIssue({ code: 'custom', message: `"${v}" is not valid here. Use ${example}, or leave it empty` });
    return z.NEVER;
  });
}

const ORCID = /^(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/i;
const links = {
  scholar: profileUrl('the full Google Scholar profile URL', () => undefined),
  orcid: profileUrl('an ORCID iD like "0000-0002-1825-0097" or "https://orcid.org/0000-0002-1825-0097"', (v) =>
    ORCID.test(v) ? `https://orcid.org/${v.toUpperCase()}` : undefined,
  ),
  github: profileUrl('a GitHub username like "octocat" or "https://github.com/octocat"', (v) =>
    /^@?[a-z0-9](?:[a-z0-9-]{0,38})$/i.test(v) ? `https://github.com/${v.replace(/^@/, '')}` : undefined,
  ),
  linkedin: profileUrl('your LinkedIn id like "jane-doe" or "https://www.linkedin.com/in/jane-doe"', (v) =>
    /^[a-z0-9-]{3,100}$/i.test(v) ? `https://www.linkedin.com/in/${v}` : undefined,
  ),
  bluesky: profileUrl('a Bluesky handle like "@name.bsky.social" or "https://bsky.app/profile/name.bsky.social"', (v) => {
    if (/bsky\.app\//i.test(v)) return undefined; // a profile URL, possibly without https://
    const h = v.replace(/^@/, '');
    if (/^[a-z0-9-]+$/i.test(h)) return `https://bsky.app/profile/${h}.bsky.social`;
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(h)) return `https://bsky.app/profile/${h}`;
    return undefined;
  }),
  x: profileUrl('an X handle like "@name" or "https://x.com/name"', (v) =>
    /^@?\w{1,15}$/.test(v) ? `https://x.com/${v.replace(/^@/, '')}` : undefined,
  ),
  researchgate: profileUrl('the full ResearchGate profile URL', () => undefined),
};

/** A CSS colour such as #0F6E56, rgb(…) or oklch(…). Empty → undefined. */
const cssColor = optionalText.refine((v) => v === undefined || /^[#a-z0-9(),.%\s/-]+$/i.test(v), {
  message: 'must be a CSS colour like "#0F6E56" or "oklch(55% 0.1 170)", or empty',
});

const optionalNumber = z.number().nonnegative().nullable().optional();

export const siteConfigSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    role: z.string().min(1, 'role is required (e.g. "Postdoctoral Researcher")'),
    affiliation: z
      .object({ name: optionalText, url: optionalUrl })
      .nullable()
      .optional()
      .transform((v) => ({ name: v?.name, url: v?.url })),
    location: optionalText,
    email: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || z.email().safeParse(v).success, {
        message: 'must be a valid email address, or empty',
      }),
    bio: z.string().min(1, 'bio is required'),
    description: z.string().min(1).max(200, 'keep description ≤ 200 characters for search results'),
    links: z
      .object(links)
      .strict()
      .prefault({}),
    cv: optionalUrl,
    nav: z
      .array(z.object({ label: z.string().min(1), href: z.string().min(1) }).strict())
      .min(1, 'nav needs at least one item'),
    metrics: z
      .object({
        citations: optionalNumber,
        h_index: optionalNumber,
        i10: optionalNumber,
        source: optionalText,
        updated: z.coerce.date().nullable().optional(),
      })
      .strict()
      .prefault({}),
    /** /publications/ settings. */
    publications: z
      .object({
        /** Altmetric donut / Dimensions citation badge next to papers with a DOI (loaded lazily from their servers). */
        badges: z
          .object({ altmetric: z.boolean().default(true), dimensions: z.boolean().default(true) })
          .strict()
          .prefault({}),
      })
      .strict()
      .prefault({}),
    repo: optionalUrl,
    analytics: z
      .object({
        goatcounter: optionalText
          // Accept the full address too: "https://snandi.goatcounter.com/count" → "snandi".
          .transform((v) => v?.replace(/^(https?:\/\/)?([a-z0-9-]+)\.goatcounter\.com.*$/i, '$2'))
          .refine((v) => v === undefined || /^[a-z0-9-]+$/i.test(v), {
            message: 'use only the code (e.g. "saswata" from saswata.goatcounter.com)',
          }),
      })
      .strict()
      .prefault({}),
    giscus: z
      .object({
        repo: optionalText,
        repo_id: optionalText,
        category: optionalText,
        category_id: optionalText,
      })
      .strict()
      .prefault({}),
    theme: z
      .object({ accent: cssColor, accent_dark: cssColor })
      .strict()
      .prefault({}),
  })
  .strict();

export type SiteConfig = z.output<typeof siteConfigSchema>;
export type LinkKey = keyof SiteConfig['links'];
