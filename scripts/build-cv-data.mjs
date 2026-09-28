#!/usr/bin/env node
/**
 * Collects everything the PDF CV needs into cv/build/cv-data.json, which cv/cv.typ reads.
 *
 *   src/data/cv.yaml          → validated with the same schema as the website (src/schemas/cv.ts)
 *   site.config.yaml          → name, role, affiliation, contact links (src/schemas/site.ts)
 *   src/data/publications.bib → parsed here with @retorquere/bibtex-parser (a small, independent
 *                               reader, so this script does not depend on Astro)
 *
 * Sections are built by src/lib/cv.ts, the same code the /cv/ page uses.
 * Run via `npm run cv:pdf` (this script + `typst compile`).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseBib } from '@retorquere/bibtex-parser';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { boldSegments, cvSections, formatUpdated, PLAIN_SECTIONS, pubGroups, withPublications } from '../src/lib/cv.ts';
import { cvSchema } from '../src/schemas/cv.ts';
import { siteConfigSchema } from '../src/schemas/site.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function validate(file, schema) {
  let data;
  try {
    data = parseYaml(read(file));
  } catch (err) {
    fail(`${file} is not valid YAML:\n  ${err.message}`);
  }
  const res = schema.safeParse(data ?? {});
  if (!res.success) fail(`${file} has problems:\n${z.prettifyError(res.error)}`);
  return res.data;
}

const cv = validate('src/data/cv.yaml', cvSchema);
const site = validate('site.config.yaml', siteConfigSchema);

/* ── Publications (same rules as src/lib/bibtex.ts, only the fields the CV needs) ── */

const SELF = { lastName: 'Nandi', firstInitial: 'S' };
const guessPubtype = (t) =>
  t === 'article'
    ? 'journal'
    : ['incollection', 'inbook', 'book'].includes(t)
      ? 'chapter'
      : ['inproceedings', 'proceedings', 'conference'].includes(t)
        ? 'proceedings'
        : 'journal';

function toAuthor(c) {
  const lastName = c.lastName ?? c.name ?? '';
  const firstName = c.firstName ?? '';
  const initials = firstName
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => (p.includes('-') ? p.split('-').map((q) => `${q[0]}.`).join('-') : `${p[0]}.`))
    .join(' ');
  return {
    display: initials ? `${lastName}, ${initials}` : lastName,
    isSelf: lastName === SELF.lastName && firstName.trim().startsWith(SELF.firstInitial),
  };
}

function readPublications() {
  const lib = parseBib(read('src/data/publications.bib'), { english: false, sentenceCase: false });
  if (lib.errors.length) fail(`publications.bib could not be parsed:\n${lib.errors.map((e) => `  • ${JSON.stringify(e)}`).join('\n')}`);
  return lib.entries.flatMap((entry) => {
    const f = entry.fields;
    const str = (k) => (typeof f[k] === 'string' && f[k].trim() ? f[k].trim() : undefined);
    const title = str('title');
    const year = Number.parseInt(str('year') ?? str('date') ?? '', 10);
    if (!title || !Number.isFinite(year)) return [];
    return [
      {
        pubtype: (str('pubtype') ?? guessPubtype(entry.type)).toLowerCase(),
        title,
        year,
        authors: (Array.isArray(f.author) ? f.author : []).map(toAuthor),
        venue: str('journal') ?? str('journaltitle') ?? str('booktitle') ?? str('howpublished'),
        volume: str('volume'),
        issue: str('number') ?? str('issue'),
        pages: str('pages')?.replace(/--/g, '–'),
        doi: str('doi')?.replace(/^https?:\/\/(dx\.)?doi\.org\//, ''),
        url: str('url'),
      },
    ];
  });
}

/* ── Assemble ─────────────────────────────────────────────────────────────── */

const updated = cv.updated ?? new Date().toISOString().slice(0, 10);
let sections = cvSections(cv).map((s) => ({ kind: 'rows', ...s }));
if (cv.pdf.publications) {
  const groups = pubGroups(readPublications());
  if (groups.length) sections = withPublications(sections, { kind: 'pubs', id: 'publications', title: 'Publications', groups });
}

const bare = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const siteUrl = (read('astro.config.mjs').match(/site:\s*['"]([^'"]+)['"]/) ?? [])[1];
const contacts = [
  site.email && { label: site.email, url: `mailto:${site.email}` },
  siteUrl && { label: bare(siteUrl), url: siteUrl },
  site.links.orcid && { label: `ORCID ${site.links.orcid.split('/').pop()}`, url: site.links.orcid },
  site.links.scholar && { label: 'Google Scholar', url: site.links.scholar },
  site.links.github && { label: bare(site.links.github), url: site.links.github },
  site.links.linkedin && { label: 'LinkedIn', url: site.links.linkedin },
].filter(Boolean);

const data = {
  paper: cv.pdf.paper,
  updated: formatUpdated(updated),
  person: {
    name: site.name,
    role: site.role,
    affiliation: site.affiliation.name ?? null,
    affiliation_url: site.affiliation.url ?? null,
    location: site.location ?? null,
  },
  contacts,
  summary: cv.summary ? boldSegments(cv.summary) : null,
  plain: PLAIN_SECTIONS,
  sections,
};

const out = join(root, 'cv/build/cv-data.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
const nPubs = sections.find((s) => s.id === 'publications')?.groups.reduce((n, g) => n + g.entries.length, 0) ?? 0;
console.log(`✓ cv/build/cv-data.json — ${sections.length} sections, ${nPubs} publications`);
