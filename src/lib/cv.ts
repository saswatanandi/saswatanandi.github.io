/**
 * Turns validated cv.yaml data (+ publications) into display-ready sections.
 *
 * Shared by the web page (src/pages/cv.astro) and the PDF data script
 * (scripts/build-cv-data.mjs → cv/cv.typ), so both show the same content in the
 * same order. Plain TypeScript with type-only imports: Node can run it directly.
 */
import type { Cv } from '../schemas/cv';

/** One entry: a date (left column) + a title and muted lines under it. */
export interface CvRow {
  when?: string;
  title: string;
  url?: string;
  /** Secondary lines (organisation, details, …). */
  lines: string[];
  /** Link for the first secondary line (e.g. the organisation's website). */
  lineUrl?: string;
}
/** A block inside a section: optional sub-heading + rows and/or an inline list. */
export interface CvGroup {
  heading?: string;
  rows: CvRow[];
  /** Inline list (e.g. journals reviewed for), shown as "A · B · C". */
  list?: string[];
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
  if (a && b) return a === b ? a : `${a} – ${b}`;
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

/* ── Sections ──────────────────────────────────────────────────────────── */

/** Section order; "publications" is filled in by the caller (see pubGroups). */
export const SECTION_ORDER = [
  'positions',
  'education',
  'publications',
  'grants',
  'awards',
  'talks',
  'teaching',
  'mentoring',
  'service',
  'skills',
  'memberships',
] as const;

export const SECTION_TITLES: Record<(typeof SECTION_ORDER)[number], string> = {
  positions: 'Positions',
  education: 'Education',
  publications: 'Publications',
  grants: 'Grants & funding',
  awards: 'Awards & honours',
  talks: 'Invited talks',
  teaching: 'Teaching',
  mentoring: 'Mentoring',
  service: 'Professional service',
  skills: 'Skills',
  memberships: 'Professional memberships',
};

/**
 * All non-publication sections, in SECTION_ORDER, empty ones removed.
 * Items keep the order written in cv.yaml (write newest first), except
 * where noted.
 */
export function cvSections(cv: Cv): CvSection[] {
  const s: Partial<Record<(typeof SECTION_ORDER)[number], CvGroup[]>> = {};

  s.positions = [
    {
      rows: visible(cv.positions).map((p) => ({
        when: formatRange(p.start, p.end),
        title: p.title,
        lines: [join(p.org, p.location), ...p.details],
        lineUrl: p.org_url,
      })),
    },
  ];

  s.education = [
    {
      rows: visible(cv.education).map((e) => ({
        when: formatCvDate(e.year) ?? formatRange(e.start, e.end),
        title: e.field ? `${e.degree}, ${e.field}` : e.degree,
        lineUrl: e.institution_url,
        lines: [
          join(e.institution, e.location),
          e.thesis && `Thesis: “${e.thesis}”`,
          e.advisor && `Advisor: ${e.advisor}`,
          ...e.details,
        ].filter((l): l is string => Boolean(l)),
      })),
    },
  ];

  s.grants = [
    {
      rows: visible(cv.grants).map((g) => ({
        when: formatRange(g.start, g.end),
        title: g.title,
        url: g.url,
        lines: [
          [g.funder, g.amount].filter(Boolean).join(' · ') + (g.role ? ` (${g.role})` : ''),
          ...g.details,
        ],
      })),
    },
  ];

  s.awards = [
    {
      rows: visible(cv.awards).map((a) => ({
        when: formatCvDate(a.year),
        title: a.title,
        url: a.url,
        lines: [a.org, ...a.details].filter((l): l is string => Boolean(l)),
      })),
    },
  ];

  s.talks = [
    {
      rows: visible(cv.talks).map((t) => ({
        when: formatCvDate(t.date),
        title: t.title,
        url: t.url,
        lines: [join(t.venue, t.location), ...t.details],
      })),
    },
  ];

  s.teaching = [
    {
      rows: visible(cv.teaching).map((t) => ({
        when: t.term,
        title: t.course,
        lines: [join(t.role, t.institution), ...t.details].filter(Boolean),
      })),
    },
  ];

  s.mentoring = [
    {
      rows: newestFirst(visible(cv.mentoring), (m) => recency(m.start, m.end)).map((m) => ({
        when: formatRange(m.start, m.end),
        title: m.name,
        lines: [
          join(m.level, m.institution) + (m.topic ? ` — ${m.topic}` : ''),
          m.now && `Now: ${m.now}`,
        ].filter((l): l is string => Boolean(l)),
      })),
    },
  ];

  const sv = cv.service;
  s.service = [
    { heading: 'Journal reviewer', rows: [], list: sv.reviewer },
    {
      heading: 'Committees',
      rows: visible(sv.committees).map((c) => ({
        when: formatRange(c.start, c.end),
        title: c.role,
        lines: [c.org, ...c.details],
      })),
    },
    {
      heading: 'Conference sessions',
      rows: visible(sv.sessions).map((c) => ({
        when: formatCvDate(c.year),
        title: `${c.role}, ${c.meeting}`,
        lines: c.location ? [c.location] : [],
      })),
    },
    {
      heading: 'Outreach',
      rows: visible(sv.outreach).map((o) => ({
        when: formatCvDate(o.year),
        title: o.title,
        url: o.url,
        lines: [o.org, ...o.details].filter((l): l is string => Boolean(l)),
      })),
    },
  ];

  s.skills = [
    {
      rows: [
        ...cv.skills.map((g) => ({ when: g.group, title: g.items.join(' · '), lines: [] })),
        ...(cv.languages.length
          ? [
              {
                when: 'Languages',
                title: cv.languages.map((l) => (l.level ? `${l.language} (${l.level})` : l.language)).join(' · '),
                lines: [],
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
        lines: m.details,
      })),
    },
  ];

  return SECTION_ORDER.flatMap((id) => {
    const groups = (s[id] ?? []).filter((g) => g.rows.length > 0 || (g.list?.length ?? 0) > 0);
    return groups.length ? [{ id, title: SECTION_TITLES[id], groups }] : [];
  });
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
