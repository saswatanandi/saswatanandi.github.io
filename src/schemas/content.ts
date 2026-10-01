/**
 * Zod schemas for every hand-edited content file.
 * A typo (wrong date format, unknown topic, misspelt field) fails the build
 * with the file name and field path, instead of silently rendering wrong.
 */
import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/**
 * Research theme slugs = the file names in src/content/research/ (without .md).
 * Publications (bib `topic`), posts and reading entries refer to themes by slug,
 * so adding or renaming a theme file is all it takes; a stale slug fails the build.
 */
export const TOPICS: string[] = Object.keys(import.meta.glob('../content/research/*.md'))
  .map((p) => p.split('/').pop()!.replace(/\.md$/, ''))
  .sort();
const topic = z.string().refine((v) => TOPICS.includes(v), {
  error: (iss) =>
    `"${String(iss.input)}" is not a research theme. Use one of: ${TOPICS.join(', ')} (the file names in src/content/research/)`,
});

const url = z.url({ protocol: /^https?$/, error: 'must be a full URL starting with https://' });
const tags = z.array(z.string().trim().toLowerCase().min(1)).default([]);
/** "2026-03" or "2026-03-14" (YAML may already hand us a Date). */
const yearMonth = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'use YYYY-MM or YYYY-MM-DD')])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 7) : v.slice(0, 7)));

/* ── Markdown collections ─────────────────────────────────────────────── */

/**
 * Blog posts. `image` is Astro's image() helper (from the collection schema context), so
 * `cover: ./cover.jpg` resolves a picture next to index.md and fails the build if it is missing.
 */
export const blogSchema = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string().min(1),
      description: z.string().min(1).max(300),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags,
      topics: z.array(topic).default([]),
      /** Posts with the same series name are linked to each other, oldest first. */
      series: z.string().optional(),
      draft: z.boolean().default(false),
      /** Optional picture shown under the title and used for social cards: a file next to index.md. */
      cover: image().optional(),
      cover_alt: z.string().optional(),
      /** false = no table of contents even with many headings. */
      toc: z.boolean().default(true),
      /** false = no comment box under this post (when comments are set up). */
      comments: z.boolean().default(true),
    })
    .strict()
    .refine((d) => !d.cover || !!d.cover_alt, {
      error: 'cover_alt: describe the cover picture in a sentence (for screen readers)',
      path: ['cover_alt'],
    });

/**
 * A longer note on a paper in reading.yaml: src/content/reading/notes/<slug>.md,
 * linked from the entry with `note: <slug>`. The paper reference comes from the entry.
 */
export const readingNoteSchema = z
  .object({
    /** Optional heading; defaults to the paper title. */
    title: z.string().min(1).optional(),
    /** When you wrote the note (optional). */
    date: z.coerce.date().optional(),
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
    /** The theme's picture (see `figure` above). */
    image: figure,
    /** Describe the picture for screen readers (required). */
    image_alt: z.string().min(10, 'image_alt: describe the picture in a sentence'),
    image_caption: z.string().optional(),
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
          })
          .strict(),
      )
      .default([]),
    /** Optional smaller picture for the home-page card (defaults to `image`). */
    thumbnail: figure.optional(),
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
    /** As you want them shown, e.g. "Beven, K." or "Smith, J., Lee, K. and Rao, P." */
    authors: z.string().min(1),
    /** Journal (or book, preprint server, report series). */
    venue: z.string().min(1).optional(),
    year: z.number({ error: 'year must be a number like 2024 (no quotes)' }).int().min(1800).max(2100),
    doi: z
      .string()
      .trim()
      .regex(/^10\.\d{4,9}\/\S+$/, 'doi should look like 10.1029/2024WR012345 (no https://doi.org/ prefix)')
      .optional(),
    /** Link used when there is no DOI (preprint, report). */
    url: url.optional(),
    /** When you read it: YYYY-MM. */
    read: yearMonth,
    tags,
    topics: z.array(topic).default([]),
    /** One line: why it is worth reading. */
    why: z.string().min(1),
    /** Slug of a longer note: src/content/reading/notes/<slug>.md (optional). */
    note: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, 'note is the note file name without .md, e.g. beven-2006 (lowercase, digits, hyphens)')
      .optional(),
    draft: z.boolean().default(false),
  })
  .strict();

/** Text of a software detail page (src/content/software/<slug>.md). Facts live in software.yaml. */
export const softwarePageSchema = z
  .object({
    /** Last time you checked the page against the current release (shown at the bottom). */
    updated: z.coerce.date().optional(),
    /** Longer text for search engines (defaults to the tagline). */
    description: z.string().max(300).optional(),
  })
  .strict();

const doi = z
  .string()
  .trim()
  .regex(/^10\.\d{4,9}\/\S+$/, 'doi should look like 10.1016/j.envsoft.2023.105869 (no https://doi.org/ prefix)');

export const softwareSchema = z
  .object({
    name: z.string().min(1),
    /** Which section of /software/ the card goes in: a code package, or a dashboard (a web app). */
    kind: z
      .enum(['package', 'dashboard'], { error: 'kind must be package or dashboard (or leave it out for a package)' })
      .default('package'),
    /** One line under the name on a dashboard card, e.g. what the acronym stands for. */
    subtitle: z.string().min(1).optional(),
    /** URL part for the detail page (/software/<slug>/). Defaults to the name in lowercase. */
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'slug: lowercase letters, digits and hyphens only')
      .optional(),
    /** One short line under the name. */
    tagline: z.string().min(1).optional(),
    description: z.string().min(1),
    repo: url.optional(),
    docs: url.optional(),
    /** PyPI package name, e.g. imdlib. */
    pypi: z.string().optional(),
    /** A project website that is not the repository or the docs (a dashboard, a lab page). */
    website: url.optional(),
    language: z.string().optional(),
    license: z.string().optional(),
    /** Latest released version, shown as a badge (entered by hand). */
    version: z.string().optional(),
    /** Short status word shown as a badge, e.g. "Active" (optional). */
    status: z.string().optional(),
    featured: z.boolean().default(false),
    /** true = a detail page /software/<slug>/ from src/content/software/<slug>.md */
    page: z.boolean().default(false),
    /** Install commands shown on cards, one per line, e.g. "pip install imdlib". */
    install: z.array(z.string().min(1)).default([]),
    /** Short usage example on the featured card (lines starting with # are comments). */
    snippet: z.string().optional(),
    /** Manual stats (no API calls at build time). null = hidden. */
    stats: z
      .object({
        stars: z.number().int().nonnegative().nullable().default(null),
        downloads: z.number().int().nonnegative().nullable().default(null),
        /** What the downloads number counts, e.g. "PyPI downloads". */
        downloads_label: z.string().default('downloads'),
        /** When you copied the numbers: YYYY-MM-DD. */
        as_of: z.coerce.date({ error: 'as_of must look like 2026-09-28' }).nullable().default(null),
      })
      .strict()
      .default({ stars: null, downloads: null, downloads_label: 'downloads', as_of: null }),
    /** How to cite: text (Markdown allowed) and the DOI of the paper. */
    citation: z
      .object({
        text: z.string().min(1),
        doi: doi.optional(),
        /** Key in publications.bib, links to /publications/<key>/. */
        bib: z.string().optional(),
        /** DOI of the archived software (e.g. Zenodo), optional. */
        software_doi: doi.optional(),
      })
      .strict()
      .optional(),
    /** Extra links for the detail page, e.g. a video tutorial. */
    links: z.array(z.object({ label: z.string().min(1), url }).strict()).default([]),
  })
  .strict()
  .refine((d) => d.kind !== 'dashboard' || !!d.website, {
    error: 'a dashboard (kind: dashboard) needs website: its full https:// address',
    path: ['website'],
  });
