/**
 * Reads `src/data/publications.bib` and turns it into typed publication objects.
 *
 * Parser: @retorquere/bibtex-parser (the parser behind Better BibTeX for Zotero):
 * handles LaTeX accents/commands ({\"o} → ö, \& → &), braces, @string macros and
 * name lists. Custom fields (pubtype, selected, topic, pdf, …) are validated with Zod
 * so a typo stops the build with the entry key in the message.
 *
 * Phase 2 extends this (talks, grouping, BibTeX export, detail pages); keep the
 * `Publication` shape backwards compatible.
 */
import { parse } from '@retorquere/bibtex-parser';
import { z } from 'astro/zod';
import raw from '../data/publications.bib?raw';
import { TOPICS, topic } from '../schemas/content';

/** How to recognise "me" in author lists (bolded everywhere). */
export const SELF = { lastName: 'Nandi', firstInitial: 'S' } as const;

export const PUBTYPES = ['journal', 'chapter', 'proceedings', 'abstract', 'talk'] as const;
export type PubType = (typeof PUBTYPES)[number];

export interface Author {
  /** "Nandi, S." */
  display: string;
  lastName: string;
  firstName: string;
  isSelf: boolean;
}

export interface Publication {
  key: string;
  bibtype: string;
  pubtype: PubType;
  title: string;
  authors: Author[];
  year: number;
  /** Journal, book title or conference name. */
  venue?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  selected: boolean;
  topics: (typeof TOPICS)[number][];
  pdf?: string;
  code?: string;
  data?: string;
  slides?: string;
  summary?: string;
  abstract?: string;
  /** The original BibTeX entry text (for "Copy BibTeX"). */
  bibtex: string;
}

const httpUrl = z.url({ protocol: /^https?$/ }).optional();
const customFields = z.object({
  pubtype: z.enum(PUBTYPES).optional(),
  selected: z
    .enum(['true', 'false', 'yes', 'no'])
    .optional()
    .transform((v) => v === 'true' || v === 'yes'),
  topic: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(/[,;]\s*/).map((t) => t.trim()).filter(Boolean) : []))
    .pipe(z.array(topic)),
  pdf: httpUrl.or(z.string().startsWith('/')),
  code: httpUrl,
  data: httpUrl,
  slides: httpUrl.or(z.string().startsWith('/')),
});

function guessPubtype(bibtype: string): PubType {
  switch (bibtype) {
    case 'article':
      return 'journal';
    case 'incollection':
    case 'inbook':
    case 'book':
      return 'chapter';
    case 'inproceedings':
    case 'proceedings':
    case 'conference':
      return 'proceedings';
    default:
      return 'journal';
  }
}

function toAuthor(c: { lastName?: string; firstName?: string; name?: string }): Author {
  const lastName = c.lastName ?? c.name ?? '';
  const firstName = c.firstName ?? '';
  const initials = firstName
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => (p.includes('-') ? p.split('-').map((q) => `${q[0]}.`).join('-') : `${p[0]}.`))
    .join(' ');
  const isSelf = lastName === SELF.lastName && firstName.trim().startsWith(SELF.firstInitial);
  return { display: initials ? `${lastName}, ${initials}` : lastName, lastName, firstName, isSelf };
}

function load(): Publication[] {
  const lib = parse(raw, { english: false, sentenceCase: false });
  if (lib.errors.length) {
    const msgs = lib.errors.map((e) => `  • ${JSON.stringify(e)}`).join('\n');
    throw new Error(`\n✖ publications.bib could not be parsed:\n${msgs}\n`);
  }

  const seen = new Set<string>();
  return lib.entries.map((entry) => {
    const f = entry.fields as Record<string, unknown>;
    const str = (k: string) => (typeof f[k] === 'string' && (f[k] as string).trim() ? (f[k] as string).trim() : undefined);

    if (seen.has(entry.key)) throw new Error(`\n✖ publications.bib: duplicate key "${entry.key}".\n`);
    seen.add(entry.key);

    const custom = customFields.safeParse({
      pubtype: str('pubtype'),
      selected: str('selected')?.toLowerCase(),
      topic: str('topic'),
      pdf: str('pdf'),
      code: str('code'),
      data: str('data'),
      slides: str('slides'),
    });
    if (!custom.success) {
      throw new Error(`\n✖ publications.bib entry "${entry.key}":\n${z.prettifyError(custom.error)}\n`);
    }

    const title = str('title');
    const year = Number.parseInt(str('year') ?? str('date') ?? '', 10);
    if (!title) throw new Error(`\n✖ publications.bib entry "${entry.key}" has no title.\n`);
    if (!Number.isFinite(year)) throw new Error(`\n✖ publications.bib entry "${entry.key}" needs a year = {YYYY}.\n`);

    const authors = (Array.isArray(f.author) ? f.author : []).map(toAuthor);
    const publisher = Array.isArray(f.publisher) ? (f.publisher as string[]).join(', ') : undefined;

    return {
      key: entry.key,
      bibtype: entry.type,
      pubtype: custom.data.pubtype ?? guessPubtype(entry.type),
      title,
      authors,
      year,
      venue: str('journal') ?? str('journaltitle') ?? str('booktitle') ?? str('howpublished'),
      volume: str('volume'),
      issue: str('number') ?? str('issue'),
      pages: str('pages')?.replace(/--/g, '–'),
      publisher,
      doi: str('doi')?.replace(/^https?:\/\/(dx\.)?doi\.org\//, ''),
      url: str('url'),
      selected: custom.data.selected,
      topics: custom.data.topic,
      pdf: custom.data.pdf,
      code: custom.data.code,
      data: custom.data.data,
      slides: custom.data.slides,
      summary: str('summary'),
      abstract: str('abstract'),
      bibtex: entry.input,
    } satisfies Publication;
  });
}

let cache: Publication[] | undefined;

/** All publications, newest first. */
export function getPublications(): Publication[] {
  cache ??= load().sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return cache;
}

export function getSelectedPublications(): Publication[] {
  return getPublications().filter((p) => p.selected);
}
