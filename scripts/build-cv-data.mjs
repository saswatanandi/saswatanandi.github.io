#!/usr/bin/env node
/**
 * Collects everything the PDF CV needs into cv/build/cv-data.json, which cv/cv.typ reads.
 *
 *   src/data/cv.yaml          → validated with src/schemas/cv.ts
 *   site.config.yaml          → name, role, affiliation, contact links (src/schemas/site.ts)
 *   src/data/publications.bib → read by src/lib/pubcore.ts, the same rules the website uses
 *                               (a bib error stops this script, and so the CI deploy, loudly)
 *
 * Sections are built by src/lib/cv.ts.
 * Run via `npm run cv:pdf` (this script + `typst compile`).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { boldSegments, cvSections, formatUpdated, PLAIN_SECTIONS, pubGroups, withPublications } from '../src/lib/cv.ts';
import { readPublications } from '../src/lib/pubcore.ts';
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

/* ── Publications: the same reader as the website (src/lib/pubcore.ts) ── */

function publications() {
  const topics = readdirSync(join(root, 'src/content/research'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
  try {
    return readPublications(read('src/data/publications.bib'), { topics });
  } catch (err) {
    fail(String(err instanceof Error ? err.message : err).trim().replace(/^✖\s*/, ''));
  }
}

/* ── Assemble ─────────────────────────────────────────────────────────────── */

const updated = cv.updated ?? new Date().toISOString().slice(0, 10);
let sections = cvSections(cv).map((s) => ({ kind: 'rows', ...s }));
if (cv.pdf.publications) {
  const groups = pubGroups(publications());
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
