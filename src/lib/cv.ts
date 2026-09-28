/**
 * Turns validated cv.yaml data (+ publications) into display-ready sections.
 *
 * Shared by the web page (src/pages/cv.astro) and the PDF data script
 * (scripts/build-cv-data.mjs → cv/cv.typ), so both show the same content in the
 * same order. Plain TypeScript with type-only imports: Node can run it directly.
 */
import type { Cv } from '../schemas/cv';

/** One entry: a date (left column) + a title, muted lines and bullet points under it. */
export interface CvRow {
  when?: string;
  title: string;
  url?: string;
  /** Secondary lines (organisation, location, …). */
  lines: string[];
  /** Link for the first secondary line (e.g. the organisation's website). */
  lineUrl?: string;
  /** Bullet points (the item's `details`). */
  bullets: string[];
}
/** A block inside a section: optional sub-heading + rows and/or an inline list. */
export interface CvGroup {
  heading?: string;
  rows: CvRow[];
  /** Inline list (e.g. journals reviewed for), shown as "A · B · C". */
  list?: string[];
  /** One line after the list. */
  note?: string;
}
export interface CvSection {
  id: string;
  title: string;
  groups: CvGroup[];
}

/** Minimal publication shape (a subset of lib/bibtex's Publication). */
export interface CvPub {
  pubtype: string;
  title: string;
  year: number;
  authors: { display: string; isSelf: boolean }[];
  venue?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
}
export interface CvPubEntry {
  /** "J12" */
  label: string;
  year: number;
  title: string;
  url?: string;
  authors: { name: string; self: boolean }[];
  venue?: string;
  /** "12(3), 45–67" */
  details?: string;
}
export interface CvPubGroup {
  id: string;
  heading: string;
  entries: CvPubEntry[];
}

/* ── Dates ─────────────────────────────────────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2021" → "2021", "2021-08" → "Aug 2021", "present" → "present". */
export function formatCvDate(d?: string): string | undefined {
  if (!d) return undefined;
  if (d === 'present') return 'present';
  const [y, m] = d.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

/** "Aug 2021 – present", "2019 – 2021", "2021" (start only or start = end). */
export function formatRange(start?: string, end?: string): string | undefined {
  const a = formatCvDate(start);
  const b = formatCvDate(end);
  if (a && b) {
    if (a === b) return a;
    // "Jan – Apr 2015" rather than "Jan 2015 – Apr 2015"
    const [ma, ya] = a.split(' ');
    const [mb, yb] = b.split(' ');
    if (ya && yb && ya === yb) return `${ma} – ${mb} ${yb}`;
    return `${a} – ${b}`;
  }
  if (a) return a;
  return b === 'present' ? undefined : b;
}

/** "2026-09-28" → "September 2026". */
export function formatUpdated(iso: string): string {
  const [y, m] = iso.split('-');
  const long = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${long[Number(m) - 1]} ${y}`;
}

/** Sort key for "newest first": ongoing items first, then by end/start date. */
function recency(start?: string, end?: string): string {
  if (end === 'present') return '9999';
  return end ?? start ?? '0000';
}
const newestFirst = <T>(items: T[], key: (t: T) => string) =>
  [...items].sort((a, b) => key(b).localeCompare(key(a)));

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(', ');
const visible = <T extends { draft?: boolean }>(items: T[]) => items.filter((i) => !i.draft);
const present = (...lines: (string | undefined | false)[]) => lines.filter((l): l is string => Boolean(l));

/* ── Sections ──────────────────────────────────────────────────────────── */

/** Section order; "publications" is filled in by the caller (see pubGroups). */
export const SECTION_ORDER = [
  'interests',
  'positions',
  'education',
  'publications',
  'grants',
  'awards',
  'talks',
  'software',
  'teaching',
  'mentoring',
  'service',
  'press',
  'skills',
  'memberships',
  'references',
] as const;
export type SectionId = (typeof SECTION_ORDER)[number];

export const SECTION_TITLES: Record<SectionId, string> = {
  interests: 'Research interests',
  positions: 'Positions',
  education: 'Education',
  publications: 'Publications',
  grants: 'Grants & funding',
  awards: 'Honours & fellowships',
  talks: 'Invited talks',
  software: 'Software & data products',
  teaching: 'Teaching',
  mentoring: 'Student mentoring',
  service: 'Professional service',
  press: 'Press & media',
  skills: 'Technical skills',
  memberships: 'Professional memberships',
  references: 'References',
};

/** Sections whose rows are "label | text" (no bold title). */
export const PLAIN_SECTIONS: readonly string[] = ['interests', 'skills'];

/**
 * All non-publication sections, in SECTION_ORDER, empty ones removed.
 * Items keep the order written in cv.yaml (write newest first), except mentoring
 * (sorted newest first).
 */
export function cvSections(cv: Cv): CvSection[] {
  const s: Partial<Record<SectionId, CvGroup[]>> = {};

  s.interests = [
    { rows: cv.interests.map((i) => ({ when: i.area, title: i.description ?? '', lines: [], bullets: [] })) },
  ];

  s.positions = [
    {
      rows: visible(cv.positions).map((p) => ({
        when: formatRange(p.start, p.end),
        title: p.title,
        lines: present(join(p.org, p.location)),
        lineUrl: p.org_url,
        bullets: p.details,
      })),
    },
  ];

  s.education = [
    {
      rows: visible(cv.education).map((e) => ({
        when: formatCvDate(e.year) ?? formatRange(e.start, e.end),
        title: e.field ? `${e.degree}, ${e.field}` : e.degree,
        lineUrl: e.institution_url,
        lines: present(
          join(e.institution, e.location),
          e.thesis && `Thesis: “${e.thesis}”`,
          e.advisor && `Advisor: ${e.advisor}`,
        ),
        bullets: e.details,
      })),
    },
  ];

  s.grants = [
    {
      rows: visible(cv.grants).map((g) => ({
        when: formatRange(g.start, g.end),
        title: g.title,
        url: g.url,
        lines: present([g.funder, g.amount].filter(Boolean).join(' · '), g.role),
        bullets: g.details,
      })),
    },
  ];

  s.awards = [
    {
      rows: visible(cv.awards).map((a) => ({
        when: formatCvDate(a.year),
        title: a.title,
        url: a.url,
        lines: [...present(a.org), ...a.details],
        bullets: [],
      })),
    },
  ];

  s.talks = [
    {
      rows: visible(cv.talks).map((t) => ({
        when: formatCvDate(t.date),
        title: t.title,
        url: t.url,
        lines: present(join(t.venue, t.location)),
        bullets: t.details,
      })),
    },
  ];

  s.software = [
    {
      rows: visible(cv.software).map((x) => ({
        title: x.name,
        url: x.url,
        lines: [x.description],
        bullets: [],
      })),
    },
  ];

  s.teaching = [
    {
      rows: visible(cv.teaching).map((t) => ({
        when: t.term,
        title: t.course,
        lines: present(join(t.role, t.institution)),
        bullets: t.details,
      })),
    },
  ];

  s.mentoring = [
    {
      rows: newestFirst(visible(cv.mentoring), (m) => recency(m.start, m.end)).map((m) => ({
        when: m.dates ?? formatRange(m.start, m.end),
        title: m.name,
        lines: present(join(m.level, m.institution) + (m.topic ? ` — ${m.topic}` : ''), m.now && `Now: ${m.now}`),
        bullets: [],
      })),
    },
  ];

  const sv = cv.service;
  s.service = [
    { heading: 'Journal reviewer', rows: [], list: sv.reviewer, note: sv.reviewer_note },
    {
      heading: 'Editorial service',
      rows: visible(sv.editorial).map((e) => ({
        when: formatRange(e.start, e.end),
        title: `${e.role}, ${e.journal}`,
        lines: [],
        bullets: e.details,
      })),
    },
    {
      heading: 'Committees & events organised',
      rows: visible(sv.committees).map((c) => ({
        when: c.dates ?? formatRange(c.start, c.end),
        title: c.role,
        lines: [c.org],
        bullets: c.details,
      })),
    },
    {
      heading: 'Conference sessions',
      rows: visible(sv.sessions).map((c) => ({
        when: formatCvDate(c.year),
        title: `${c.role}, ${c.meeting}`,
        lines: present(c.location),
        bullets: [],
      })),
    },
    {
      heading: 'Outreach',
      rows: visible(sv.outreach).map((o) => ({
        when: formatCvDate(o.year),
        title: o.title,
        url: o.url,
        lines: present(o.org),
        bullets: o.details,
      })),
    },
  ];

  s.press = [
    {
      rows: visible(cv.press).map((x) => ({
        when: formatCvDate(x.date),
        title: x.title,
        url: x.url,
        lines: [x.outlet],
        bullets: [],
      })),
    },
  ];

  s.skills = [
    {
      rows: [
        ...cv.skills.map((g) => ({ when: g.group, title: g.items.join(' · '), lines: [], bullets: [] })),
        ...(cv.languages.length
          ? [
              {
                when: 'Languages',
                title: cv.languages.map((l) => (l.level ? `${l.language} (${l.level})` : l.language)).join(' · '),
                lines: [],
                bullets: [],
              },
            ]
          : []),
      ],
    },
  ];

  s.memberships = [
    {
      rows: visible(cv.memberships).map((m) => ({
        when: m.since ? `${formatCvDate(m.since)} –` : undefined,
        title: m.org,
        lines: [],
        bullets: m.details,
      })),
    },
  ];

  s.references = cv.show_references
    ? [
        {
          rows: visible(cv.references).map((r) => ({
            title: r.name,
            lines: present(join(r.title, r.department, r.org), r.email, r.relation && `(${r.relation})`),
            bullets: [],
          })),
        },
      ]
    : [];

  return SECTION_ORDER.flatMap((id) => {
    const groups = (s[id] ?? []).filter((g) => g.rows.length > 0 || (g.list?.length ?? 0) > 0);
    return groups.length ? [{ id, title: SECTION_TITLES[id], groups }] : [];
  });
}

/** "a **b** c" → [{text:"a "}, {text:"b", bold:true}, {text:" c"}] (the only markup allowed in `summary`). */
export function boldSegments(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((x) => x.text);
}

/** Inserts `item` (the publications block) at its place in SECTION_ORDER. */
export function withPublications<T extends { id: string }>(sections: T[], item: T): T[] {
  const rank = (id: string) => SECTION_ORDER.indexOf(id as SectionId);
  const at = sections.findIndex((x) => rank(x.id) > rank('publications'));
  const out = [...sections];
  out.splice(at === -1 ? out.length : at, 0, item);
  return out;
}

/* ── Publications ──────────────────────────────────────────────────────── */

/** Publication groups on the CV (pubtype → heading, label prefix). Talks live in cv.yaml. */
export const PUB_GROUPS = [
  { id: 'journal', heading: 'Journal articles', prefix: 'J' },
  { id: 'chapter', heading: 'Book chapters', prefix: 'B' },
  { id: 'proceedings', heading: 'Conference proceedings', prefix: 'P' },
  { id: 'abstract', heading: 'Conference abstracts', prefix: 'A' },
] as const;

/**
 * Publications grouped by type, newest first, numbered downwards (J12 … J1) so a
 * paper keeps its number when new ones are added.
 */
export function pubGroups(pubs: CvPub[]): CvPubGroup[] {
  return PUB_GROUPS.flatMap((g) => {
    const items = pubs
      .filter((p) => p.pubtype === g.id)
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
    if (!items.length) return [];
    return [
      {
        id: g.id,
        heading: g.heading,
        entries: items.map((p, i) => ({
          label: `${g.prefix}${items.length - i}`,
          year: p.year,
          title: p.title,
          url: p.doi ? `https://doi.org/${p.doi}` : p.url,
          authors: p.authors.map((a) => ({ name: a.display, self: a.isSelf })),
          venue: p.venue,
          details:
            [p.volume && (p.issue ? `${p.volume}(${p.issue})` : p.volume), p.pages].filter(Boolean).join(', ') ||
            undefined,
        })),
      },
    ];
  });
}

/** Author separators: "A, B & C" (as on the publications page). */
export function authorSep(i: number, n: number): string {
  return i < n - 2 ? ', ' : i === n - 2 ? ' & ' : '';
}
