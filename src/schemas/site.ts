import { z } from 'astro/zod';

/** Empty strings in YAML mean "not set": normalise them to undefined. */
const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v ? v : undefined));

/** An optional absolute (https://) or site-relative (/path) URL. Empty → undefined. */
const optionalUrl = optionalText.refine(
  (v) => v === undefined || /^https?:\/\//.test(v) || v.startsWith('/'),
  { message: 'must be a full URL starting with https:// (or a site path starting with /), or empty' },
);

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
      .object({
        scholar: optionalUrl,
        orcid: optionalUrl,
        github: optionalUrl,
        linkedin: optionalUrl,
        bluesky: optionalUrl,
        x: optionalUrl,
        researchgate: optionalUrl,
      })
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
    repo: optionalUrl,
    analytics: z
      .object({
        goatcounter: optionalText.refine((v) => v === undefined || /^[a-z0-9-]+$/i.test(v), {
          message: 'use only the code (e.g. "saswata"), not the full URL',
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
