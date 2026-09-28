/**
 * Zod schema for `src/data/cv.yaml`.
 *
 * Self-contained on purpose (imports only zod): it is used by the Astro build (content
 * collection) AND by `scripts/build-cv-data.mjs`, which feeds the Typst PDF.
 *
 * Every section is optional; an empty or missing list is simply not shown.
 * Dates are flexible: a year (2021) or year-month (2021-08). `end` may also be "present".
 * An empty value ("") counts as "not filled in yet" and is ignored.
 */
import { z } from 'astro/zod';

const blank = (v: unknown) => (v === '' || v === null ? undefined : v);

/** Optional text; "" → not set. */
const text = z.preprocess(blank, z.string().trim().min(1).optional());
/** Required text. */
const req = (what: string) => z.string({ error: `${what} is required` }).trim().min(1, `${what} is required`);

const url = z.preprocess(
  blank,
  z
    .string()
    .trim()
    .refine((v) => /^https?:\/\/\S+$/.test(v) || v.startsWith('/'), {
      error: 'must be a full URL starting with https:// (or a site path starting with /)',
    })
    .optional(),
);

const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const DATE_MSG = 'use a year like 2021 or a year-month like 2021-08';
const toDateText = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 7) : typeof v === 'number' ? String(v) : blank(v);

/** 2021 or 2021-08 (YAML numbers and dates are accepted too). */
const date = z.preprocess(toDateText, z.string().trim().regex(DATE_RE, DATE_MSG).optional());
/** Like `date`, or "present". */
const endDate = z.preprocess(
  toDateText,
  z
    .string()
    .trim()
    .refine((v) => DATE_RE.test(v) || /^present$/i.test(v), { error: `${DATE_MSG}, or "present"` })
    .transform((v) => (/^present$/i.test(v) ? 'present' : v))
    .optional(),
);

/** One line of text or a list of bullet lines. */
const details = z
  .preprocess(blank, z.union([z.string().trim().min(1), z.array(z.string().trim().min(1))]).optional())
  .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]));

/** Hide an item without deleting it. */
const draft = z.boolean().default(false);

/** A YAML list; `~`/null/missing = empty. */
const list = <T extends z.ZodType>(item: T) => z.preprocess((v) => v ?? [], z.array(item));

export const cvPosition = z
  .object({
    title: req('title'),
    org: req('org'),
    org_url: url,
    location: text,
    start: date,
    end: endDate,
    details,
    draft,
  })
  .strict();

export const cvEducation = z
  .object({
    degree: req('degree'),
    field: text,
    institution: req('institution'),
    institution_url: url,
    location: text,
    /** Year the degree was awarded (use start/end instead for a range). */
    year: date,
    start: date,
    end: endDate,
    thesis: text,
    advisor: text,
    details,
    draft,
  })
  .strict();

export const cvAward = z
  .object({
    title: req('title'),
    org: text,
    year: date,
    url,
    details,
    draft,
  })
  .strict();

export const cvGrant = z
  .object({
    title: req('title'),
    /** e.g. PI, Co-PI, Co-I, Contributor. */
    role: text,
    funder: req('funder'),
    /** Free text, e.g. "USD 250,000". */
    amount: text,
    start: date,
    end: endDate,
    url,
    details,
    draft,
  })
  .strict();

export const cvTalk = z
  .object({
    title: req('title'),
    /** Event, department or institution. */
    venue: req('venue'),
    location: text,
    date,
    url,
    details,
    draft,
  })
  .strict();

export const cvTeaching = z
  .object({
    course: req('course'),
    /** e.g. Instructor, Teaching Assistant, Guest lecturer. */
    role: text,
    institution: text,
    /** Free text, e.g. "Fall 2022" or "2019–2021". */
    term: text,
    details,
    draft,
  })
  .strict();

export const cvMentee = z
  .object({
    name: req('name'),
    /** e.g. PhD student, MS student, Undergraduate, Intern. */
    level: text,
    institution: text,
    start: date,
    end: endDate,
    topic: text,
    /** Where they are now. */
    now: text,
    draft,
  })
  .strict();

const committee = z
  .object({ role: req('role'), org: req('org'), start: date, end: endDate, details, draft })
  .strict();
const session = z
  .object({
    /** e.g. Convener, Chair, Co-chair. */
    role: req('role'),
    /** Session title and/or meeting, e.g. "H123: Wildfire hydrology, AGU Fall Meeting". */
    meeting: req('meeting'),
    location: text,
    year: date,
    draft,
  })
  .strict();
const outreach = z.object({ title: req('title'), org: text, year: date, url, details, draft }).strict();

export const cvService = z
  .object({
    /** Journals you review for (one name per line). */
    reviewer: list(z.string().trim().min(1)),
    committees: list(committee),
    sessions: list(session),
    outreach: list(outreach),
  })
  .strict();

const skillGroup = z.object({ group: req('group'), items: z.array(z.string().trim().min(1)).min(1) }).strict();
const language = z.object({ language: req('language'), level: text }).strict();
const membership = z.object({ org: req('org'), since: date, details, draft }).strict();

export const cvSchema = z
  .object({
    /** Optional note shown at the top of the web CV (not in the PDF). Delete when the CV is complete. */
    notice: text,
    /** "Last updated" date shown on the page and the PDF (YYYY-MM or YYYY-MM-DD); empty = build date. */
    updated: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : blank(v)),
      z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'use YYYY-MM or YYYY-MM-DD').optional(),
    ),
    /** PDF options. */
    pdf: z
      .object({
        paper: z.enum(['us-letter', 'a4'], { error: 'paper must be "us-letter" or "a4"' }).default('us-letter'),
        /** Include the publication list in the PDF. */
        publications: z.boolean().default(true),
      })
      .strict()
      .prefault({}),
    positions: list(cvPosition),
    education: list(cvEducation),
    grants: list(cvGrant),
    awards: list(cvAward),
    talks: list(cvTalk),
    teaching: list(cvTeaching),
    mentoring: list(cvMentee),
    service: z.preprocess((v) => v ?? {}, cvService),
    skills: list(skillGroup),
    languages: list(language),
    memberships: list(membership),
  })
  .strict();

export type Cv = z.infer<typeof cvSchema>;
