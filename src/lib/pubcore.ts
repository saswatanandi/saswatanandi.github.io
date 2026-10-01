/**
 * The one set of rules for reading `src/data/publications.bib`, shared by
 *   - the website (src/lib/bibtex.ts adds the Astro bits: the ?raw import and theme list), and
 *   - the PDF CV (scripts/build-cv-data.mjs → cv/cv.typ).
 *
 * Parser: @retorquere/bibtex-parser (the parser behind Better BibTeX for Zotero):
 * handles LaTeX accents/commands ({\"o} → ö, \& → &, \textsubscript{2} → ₂), braces,
 * @string macros and name lists. Custom fields (pubtype, selected, topic, pdf, …) are
 * validated with Zod so a typo stops the build with the entry key in the message.
 *
 * No Astro-only imports and only erasable TypeScript, so Node runs it directly.
 * Keep the `Publication` shape backwards compatible (add fields, don't rename them).
 */
import { parse } from '@retorquere/bibtex-parser';
import { z } from 'astro/zod';

/** How to recognise "me" in author lists (bolded everywhere). */
const SELF = { lastName: 'Nandi', firstInitial: 'S' } as const;

const PUBTYPES = ['journal', 'chapter', 'proceedings', 'abstract', 'talk'] as const;
export type PubType = (typeof PUBTYPES)[number];

/** Human labels for each pubtype (singular). */
export const PUBTYPE_LABEL: Record<PubType, string> = {
  journal: 'Journal article',
  chapter: 'Book chapter',
  proceedings: 'Conference paper',
  abstract: 'Conference abstract',
  talk: 'Talk',
};

/** The tabs on /publications/, in order. `talk` and `abstract` share one tab. */
export const PUB_GROUPS = [
  { id: 'journal', label: 'Journal articles', types: ['journal'] },
  { id: 'chapters', label: 'Book chapters', types: ['chapter'] },
  { id: 'conference', label: 'Conference papers', types: ['proceedings'] },
  { id: 'talks', label: 'Talks & abstracts', types: ['abstract', 'talk'] },
] as const satisfies readonly { id: string; label: string; types: readonly PubType[] }[];
export type PubGroupId = (typeof PUB_GROUPS)[number]['id'];

interface Author {
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
  /** Plain-text title (LaTeX converted, no markup). */
  title: string;
  /** Title as safe inline HTML (keeps <i>, <sub>, <sup> from LaTeX commands). */
  titleHtml: string;
  authors: Author[];
  year: number;
  /** 1–12 when the entry has a month. */
  month?: number;
  /** "2024", "2024-05" (for Google Scholar / schema.org). */
  date: string;
  /** Journal, book title or conference name. */
  venue?: string;
  /** Book series (e.g. "Water Science and Technology Library"). */
  series?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  /** Place of publication / conference location. */
  address?: string;
  /** Free-text note, e.g. "Abstract H23S-05". */
  note?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  selected: boolean;
  /** Research theme slugs (file names in src/content/research/). */
  topics: string[];
  pdf?: string;
  code?: string;
  data?: string;
  slides?: string;
  /** Plain-language summary (plain text). */
  summary?: string;
  /** Abstract as plain text; paragraphs separated by a blank line. */
  abstract?: string;
  /** Abstract paragraphs as safe inline HTML. */
  abstractHtml: string[];
  /** Optional figure for the paper page (path in public/ or https URL) and its description. */
  image?: string;
  imageAlt?: string;
  /** Page on this site: /publications/<key>/ */
  href: string;
  /** The original BibTeX entry text, exactly as written in publications.bib. */
  bibtex: string;
  /** The entry without site-only fields (pubtype, topic, selected, pdf, …, abstract) — for "Copy BibTeX". */
  bibtexClean: string;
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
    .transform((v) => (v ? v.split(/[,;]\s*/).map((t) => t.trim()).filter(Boolean) : [])),
  pdf: httpUrl.or(z.string().startsWith('/')),
  code: httpUrl,
  data: httpUrl,
  slides: httpUrl.or(z.string().startsWith('/')),
  image: httpUrl.or(z.string().startsWith('/')),
});

/** Fields that only drive this website; stripped from "Copy BibTeX". */
const SITE_ONLY_FIELDS = new Set([
  'pubtype',
  'selected',
  'topic',
  'pdf',
  'code',
  'data',
  'slides',
  'summary',
  'image',
  'image_alt',
  'abstract',
]);

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
    case 'misc':
    case 'unpublished':
      return 'abstract';
    default:
      return 'journal';
  }
}

function toAuthor(c: { lastName?: string; firstName?: string; name?: string }): Author {
  const lastName = (c.lastName ?? c.name ?? '').trim();
  const firstName = (c.firstName ?? '').trim();
  const initials = firstName
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => (p.includes('-') ? p.split('-').map((q) => `${q[0]}.`).join('-') : `${p[0]}.`))
    .join(' ');
  const isSelf = lastName === SELF.lastName && firstName.startsWith(SELF.firstInitial);
  return { display: initials ? `${lastName}, ${initials}` : lastName, lastName, firstName, isSelf };
}

/* ── Safe HTML from the parser's rich-text output ──────────────────────── */

const ALLOWED_TAGS = /&lt;(\/?)(i|b|em|strong|sup|sub|sc)&gt;/g;
/** Escape everything, then re-allow the few inline tags the parser emits for LaTeX commands. */
function safeInline(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(ALLOWED_TAGS, (_m, slash: string, tag: string) =>
      tag === 'sc' ? (slash ? '</span>' : '<span style="font-variant:small-caps">') : `<${slash}${tag}>`,
    );
}
const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
/** The parser marks paragraph breaks (blank line or \par) with "<p>" in rich-text fields. */
const paragraphs = (s: string) =>
  s
    .split(/<p>/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * Remove site-only fields from a raw BibTeX entry, keeping everything else exactly as written
 * (brace protection, field order, formatting). Walks the entry at brace depth 1.
 */
function stripSiteFields(entry: string): string {
  const open = entry.indexOf('{');
  const close = entry.lastIndexOf('}');
  if (open < 0 || close < open) return entry;
  const head = entry.slice(0, open + 1);
  const inner = entry.slice(open + 1, close);
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '"' && depth === 0) quoted = !quoted;
    else if (ch === ',' && depth === 0 && !quoted) {
      parts.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(inner.slice(start));
  const [key, ...fields] = parts.map((p) => p.trim()).filter(Boolean);
  const kept = fields.filter((f) => !SITE_ONLY_FIELDS.has(f.split('=')[0]!.trim().toLowerCase()));
  return `${head}${key},\n${kept.map((f) => `  ${f.replace(/\n\s*/g, ' ')}`).join(',\n')}\n}`;
}

export interface ReadOptions {
  /**
   * Allowed research-theme slugs for the `topic` field (the file names in src/content/research/).
   * Omit to skip the check.
   */
  topics?: readonly string[];
}

/**
 * Parse the text of publications.bib into Publication objects, newest first
 * (year, then month, then title). Throws an Error with a readable message
 * (entry key + field) on any problem.
 */
export function readPublications(raw: string, opts: ReadOptions = {}): Publication[] {
  return load(raw, opts).sort(
    (a, b) => b.year - a.year || (b.month ?? 0) - (a.month ?? 0) || a.title.localeCompare(b.title),
  );
}

function load(raw: string, opts: ReadOptions): Publication[] {
  const lib = parse(raw, {
    english: false,
    sentenceCase: false,
    fieldMode: { abstract: 'richtext', summary: 'richtext' },
  });
  if (lib.errors.length) {
    const msgs = lib.errors.map((e) => `  • ${JSON.stringify(e)}`).join('\n');
    throw new Error(`\n✖ publications.bib could not be parsed:\n${msgs}\n`);
  }

  const seen = new Set<string>();
  return lib.entries.map((entry) => {
    const f = entry.fields as Record<string, unknown>;
    const str = (k: string) => (typeof f[k] === 'string' && (f[k] as string).trim() ? (f[k] as string).trim() : undefined);

    if (seen.has(entry.key)) throw new Error(`\n✖ publications.bib: duplicate key "${entry.key}".\n`);
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(entry.key)) {
      throw new Error(`\n✖ publications.bib: key "${entry.key}" should use only letters, digits, - and _ (it becomes the page URL).\n`);
    }
    seen.add(entry.key);

    const custom = customFields.safeParse({
      pubtype: str('pubtype'),
      selected: str('selected')?.toLowerCase(),
      topic: str('topic'),
      pdf: str('pdf'),
      code: str('code'),
      data: str('data'),
      slides: str('slides'),
      image: str('image'),
    });
    if (!custom.success) {
      throw new Error(`\n✖ publications.bib entry "${entry.key}":\n${z.prettifyError(custom.error)}\n`);
    }
    if (opts.topics) {
      const bad = custom.data.topic.filter((t) => !opts.topics!.includes(t));
      if (bad.length) {
        throw new Error(
          `\n✖ publications.bib entry "${entry.key}": topic "${bad.join('", "')}" is not a research theme. ` +
            `Use one of: ${opts.topics.join(', ')} (the file names in src/content/research/)\n`,
        );
      }
    }

    const rawTitle = str('title');
    const year = Number.parseInt(str('year') ?? str('date') ?? '', 10);
    if (!rawTitle) throw new Error(`\n✖ publications.bib entry "${entry.key}" has no title.\n`);
    if (!Number.isFinite(year)) throw new Error(`\n✖ publications.bib entry "${entry.key}" needs a year = {YYYY}.\n`);
    const monthNum = Number.parseInt(str('month') ?? str('date')?.slice(5, 7) ?? '', 10);
    const month = monthNum >= 1 && monthNum <= 12 ? monthNum : undefined;

    const authors = (Array.isArray(f.author) ? f.author : []).map(toAuthor);
    const publisher = Array.isArray(f.publisher) ? (f.publisher as string[]).join(', ') : str('publisher');
    const address = Array.isArray(f.address) ? (f.address as string[]).join(', ') : str('address');
    const abstractRich = str('abstract');
    const summaryRich = str('summary');

    return {
      key: entry.key,
      bibtype: entry.type,
      pubtype: custom.data.pubtype ?? guessPubtype(entry.type),
      title: stripTags(rawTitle),
      titleHtml: safeInline(rawTitle),
      authors,
      year,
      month,
      date: month ? `${year}-${String(month).padStart(2, '0')}` : String(year),
      venue: str('journal') ?? str('journaltitle') ?? str('booktitle') ?? str('howpublished') ?? str('eventtitle'),
      series: str('series'),
      volume: str('volume'),
      issue: str('number') ?? str('issue'),
      pages: str('pages')?.replace(/--/g, '–'),
      publisher,
      address,
      note: str('note') && stripTags(str('note')!),
      isbn: str('isbn'),
      doi: str('doi')?.replace(/^https?:\/\/(dx\.)?doi\.org\//, ''),
      url: str('url'),
      selected: custom.data.selected,
      topics: custom.data.topic,
      pdf: custom.data.pdf,
      code: custom.data.code,
      data: custom.data.data,
      slides: custom.data.slides,
      summary: summaryRich && paragraphs(summaryRich).map(stripTags).join('\n\n'),
      abstract: abstractRich && paragraphs(abstractRich).map(stripTags).join('\n\n'),
      abstractHtml: abstractRich ? paragraphs(abstractRich).map(safeInline) : [],
      image: custom.data.image,
      imageAlt: str('image_alt'),
      href: `/publications/${entry.key}/`,
      bibtex: entry.input.trim(),
      bibtexClean: stripSiteFields(entry.input.trim()),
    } satisfies Publication;
  });
}

/* ── Citation text (website and PDF CV) ────────────────────────────────── */

/** Separator after author i of n in lists with the owner in bold: "A, B & C". */
export function authorSep(i: number, n: number): string {
  return i < n - 2 ? ', ' : i === n - 2 ? ' & ' : '';
}

/** "Nandi, S., Patel, P., & Swain, S." (APA-style author list). */
function formatAuthorsApa(authors: Author[]): string {
  const names = authors.map((a) => a.display);
  if (names.length <= 1) return names.join('');
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, & ${names.at(-1)}`;
}

/**
 * APA-like reference. Returns HTML (venue/volume in <i>) and plain text (for copying).
 * Good enough for a website; for a manuscript use the BibTeX with your reference manager.
 */
export function formatCitation(p: Publication): { html: string; text: string } {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const authors = formatAuthorsApa(p.authors);
  const title = p.title.replace(/[.?!]$/, '');
  const titleEnd = /[?!]$/.test(p.title) ? p.title.slice(-1) : '.';
  const doi = p.doi ? `https://doi.org/${p.doi}` : p.url;
  let htmlTail = '';
  let textTail = '';
  if (p.pubtype === 'journal' && p.venue) {
    const vol = p.volume ? `, <i>${esc(p.volume)}</i>${p.issue ? `(${esc(p.issue)})` : ''}` : '';
    const volT = p.volume ? `, ${p.volume}${p.issue ? `(${p.issue})` : ''}` : '';
    htmlTail = `<i>${esc(p.venue)}</i>${vol}${p.pages ? `, ${esc(p.pages)}` : ''}.`;
    textTail = `${p.venue}${volT}${p.pages ? `, ${p.pages}` : ''}.`;
  } else if ((p.pubtype === 'chapter' || p.pubtype === 'proceedings') && p.venue) {
    const pages = p.pages ? ` (pp. ${p.pages})` : '';
    const pub = p.publisher ? ` ${p.publisher}.` : '';
    htmlTail = `In <i>${esc(p.venue)}</i>${esc(pages)}.${esc(pub)}`;
    textTail = `In ${p.venue}${pages}.${pub}`;
  } else if (p.venue) {
    const extra = [p.note, p.address].filter(Boolean).join(', ');
    htmlTail = `${esc(p.venue)}${extra ? `, ${esc(extra)}` : ''}.`;
    textTail = `${p.venue}${extra ? `, ${extra}` : ''}.`;
  }
  const head = `${authors} (${p.year}). `;
  const html = `${esc(head)}${esc(title)}${titleEnd} ${htmlTail}${doi ? ` <a href="${esc(doi)}">${esc(doi)}</a>` : ''}`;
  const text = `${head}${title}${titleEnd} ${textTail}${doi ? ` ${doi}` : ''}`;
  return { html: html.replace(/\s+/g, ' ').trim(), text: text.replace(/\s+/g, ' ').trim() };
}

/** "Journal of Hydrology, 610, 127842" / "AGU Fall Meeting 2024, Abstract H23S-05" (no year). */
export function venueDetails(p: Publication): string {
  const vol = p.volume && (p.issue ? `${p.volume}(${p.issue})` : p.volume);
  const pages = p.pages && (p.pubtype === 'chapter' || p.pubtype === 'proceedings') && /–/.test(p.pages) ? `pp. ${p.pages}` : p.pages;
  return [vol, pages, p.note].filter(Boolean).join(', ');
}
