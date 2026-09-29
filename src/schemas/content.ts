/**
 * Zod schemas for every hand-edited content file.
 * A typo (wrong date format, unknown topic, misspelt field) fails the build
 * with the file name and field path, instead of silently rendering wrong.
 */
import { z } from 'astro/zod';

/**
 * Research theme slugs = the file names in src/content/research/ (without .md).
 * Publications (bib `topic`), posts and reading entries refer to themes by slug,
 * so adding or renaming a theme file is all it takes; a stale slug fails the build.
 */
export const TOPICS: string[] = Object.keys(import.meta.glob('../content/research/*.md'))
  .map((p) => p.split('/').pop()!.replace(/\.md$/, ''))
  .sort();
export const topic = z.string().refine((v) => TOPICS.includes(v), {
  error: (iss) =>
    `"${String(iss.input)}" is not a research theme. Use one of: ${TOPICS.join(', ')} (the file names in src/content/research/)`,
});
export type Topic = string;

const url = z.url({ protocol: /^https?$/, error: 'must be a full URL starting with https://' });
const tags = z.array(z.string().trim().toLowerCase().min(1)).default([]);
/** "2026-03" or "2026-03-14" (YAML may already hand us a Date). */
const yearMonth = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'use YYYY-MM or YYYY-MM-DD')])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 7) : v.slice(0, 7)));

/* ── Markdown collections ─────────────────────────────────────────────── */

export const blogSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1).max(300),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags,
    topics: z.array(topic).default([]),
    series: z.string().optional(),
    draft: z.boolean().default(false),
    math: z.boolean().default(false),
    /** Canonical URL if the post was first published elsewhere. */
    canonical: url.optional(),
  })
  .strict();

export const readingNoteSchema = z
  .object({
    title: z.string().min(1),
    date: z.coerce.date(),
    /** Id of the matching entry in reading.yaml (optional). */
    entry: z.string().optional(),
    tags,
    draft: z.boolean().default(false),
  })
  .strict();

/** Built-in figures that are Astro components rather than image files (src/components/research/). */
export const FIGURE_COMPONENTS = ['cwis-pipeline'] as const;
/**
 * A theme figure: a file in src/assets/research/ (".svg" is drawn inline and follows light/dark mode;
 * ".png", ".jpg", ".webp", ".avif" are optimised photos/plots), a path in public/ starting with "/",
 * or one of FIGURE_COMPONENTS.
 */
const figure = z
  .string()
  .trim()
  .refine((v) => /\.(svg|png|jpe?g|webp|avif)$/i.test(v) || (FIGURE_COMPONENTS as readonly string[]).includes(v), {
    error: `image must be a file name ending in .svg, .png, .jpg, .webp or .avif (put the file in src/assets/research/), or one of: ${FIGURE_COMPONENTS.join(', ')}`,
  });
const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/'), {
    error: 'url must start with https:// or / (or leave it empty for no link)',
  })
  .optional()
  .transform((v) => v || undefined);

export const researchSchema = z
  .object({
    title: z.string().min(1),
    /** Position on the home page and /research/ (1 = first). */
    order: z.number().int().default(99),
    /** 1–2 sentences shown on the home-page card and under the page title. */
    summary: z.string().min(1).max(320),
    /** Small glyph from src/components/Icon.astro. */
    icon: z.enum(['fire', 'layers', 'forecast', 'thermometer', 'code'], {
      error: 'icon must be one of: fire, layers, forecast, thermometer, code',
    }),
    /** The theme's picture (see `figure` above). */
    image: figure,
    /** Describe the picture for screen readers (required). */
    image_alt: z.string().min(10, 'image_alt: describe the picture in a sentence'),
    image_caption: z.string().optional(),
    /** Optional link under the figure, e.g. to a full-size original. */
    image_full: optionalUrl,
    /**
     * Extra figures for the theme page. In the text, `<!-- figure 2 -->` places the first
     * of these, `<!-- figure 3 -->` the second, … (`<!-- figure -->` = the main `image`).
     */
    figures: z
      .array(
        z
          .object({
            image: figure,
            alt: z.string().min(10, 'figures[].alt: describe the picture in a sentence'),
            caption: z.string().optional(),
            /** Optional "View full diagram" link. */
            full: optionalUrl,
          })
          .strict(),
      )
      .default([]),
    /** Optional smaller picture for the home-page card (defaults to `image`). */
    thumbnail: figure.optional(),
    /** Optional highlighted tool, dataset or project. Leave `url` empty for no link. */
    feature: z
      .object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        description: z.string().min(1),
        url: optionalUrl,
      })
      .strict()
      .optional(),
    /** Hidden when empty. */
    collaborators: z
      .array(z.object({ name: z.string().min(1), affiliation: z.string().optional(), url: optionalUrl }).strict())
      .default([]),
    /** Hidden when empty. One line per grant/funder. */
    funding: z.array(z.string().min(1)).default([]),
  })
  .strict();

/* ── YAML data files (src/data/*.yaml) ────────────────────────────────── */

export const newsSchema = z
  .object({
    date: z.coerce.date({ error: 'date must look like 2026-03-14' }),
    /** Markdown allowed (links, **bold**). Keep it to one or two lines. */
    text: z.string().min(1),
    link: url.or(z.string().startsWith('/')).optional(),
    draft: z.boolean().default(false),
  })
  .strict();

export const readingSchema = z
  .object({
    title: z.string().min(1),
    authors: z.string().min(1),
    journal: z.string().optional(),
    year: z.number().int().min(1800).max(2100),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, 'doi should look like 10.1029/2024WR012345 (no https://doi.org/ prefix)')
      .optional(),
    url: url.optional(),
    /** When you read it: YYYY-MM. */
    read: yearMonth,
    tags,
    topics: z.array(topic).default([]),
    /** One line: why it is worth reading. */
    why: z.string().min(1),
    /** Slug of a longer note in src/content/reading/notes/ (optional). */
    note: z.string().optional(),
    draft: z.boolean().default(false),
  })
  .strict();

export const softwareSchema = z
  .object({
    name: z.string().min(1),
    repo: url,
    description: z.string().min(1),
    language: z.string().optional(),
    pypi: z.string().optional(),
    conda: z.string().optional(),
    docs: url.optional(),
    paper_doi: z.string().optional(),
    /** Short usage example shown on the featured card (plain text; lines starting with # are comments). */
    snippet: z.string().optional(),
    /** Manual stats (no API calls at build time). null = unknown. */
    stars: z.number().int().nonnegative().nullable().default(null),
    downloads: z.number().int().nonnegative().nullable().default(null),
    stats_updated: z.coerce.date().nullable().optional(),
    featured: z.boolean().default(false),
    tags,
  })
  .strict();
