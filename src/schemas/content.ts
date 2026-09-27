/**
 * Zod schemas for every hand-edited content file.
 * A typo (wrong date format, unknown topic, misspelt field) fails the build
 * with the file name and field path, instead of silently rendering wrong.
 */
import { z } from 'astro/zod';

/** Research topic keys. Used by research themes, publications (bib `topic`), posts and reading. */
export const TOPICS = ['forest-fire', 'lsm-modelling', 'forecasting', 'climate-impact', 'open-data'] as const;
export const topic = z.enum(TOPICS, {
  error: () => `topic must be one of: ${TOPICS.join(', ')}`,
});
export type Topic = z.infer<typeof topic>;

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

export const researchSchema = z
  .object({
    title: z.string().min(1),
    /** Topic key — must match the `topic` field used in publications.bib. */
    key: topic,
    /** One of the icon names in src/components/ThemeIcon.astro. */
    icon: z.enum(['fire', 'layers', 'forecast', 'thermometer', 'code']),
    /** 1–2 sentence summary shown on tiles and cards. */
    summary: z.string().min(1).max(320),
    order: z.number().int().default(99),
    /** Study areas (for the Phase 4 basin map). */
    regions: z.array(z.string()).default([]),
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

const cvItem = z
  .object({
    title: z.string().min(1),
    org: z.string().optional(),
    location: z.string().optional(),
    start: z.union([z.string(), z.number()]).transform(String).optional(),
    end: z.union([z.string(), z.number()]).transform(String).optional(),
    details: z.string().optional(),
    url: url.optional(),
  })
  .strict();

export const cvSchema = z
  .object({
    education: z.array(cvItem).default([]),
    positions: z.array(cvItem).default([]),
    awards: z.array(cvItem).default([]),
    service: z.array(cvItem).default([]),
    mentoring: z.array(cvItem).default([]),
    teaching: z.array(cvItem).default([]),
  })
  .strict();

export type CvItem = z.infer<typeof cvItem>;
