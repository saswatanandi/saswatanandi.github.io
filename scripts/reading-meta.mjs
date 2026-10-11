#!/usr/bin/env node
/**
 * Fills in title / authors / venue / year for reading entries that only have a DOI.
 * Runs automatically before `npm run dev` and `npm run build` (and on GitHub).
 *
 *   src/data/reading.yaml  →  .cache/reading-meta.json   (git-ignored; kept between GitHub builds)
 *
 * For every entry with a `doi` that is missing any of title, authors, venue or year, and whose DOI
 * is not in the cache yet, it asks Crossref (api.crossref.org). The site then fills ONLY the missing
 * fields from the cache when it loads reading.yaml (src/lib/reading-meta.ts): fields you type win.
 *
 * This script never stops the build: no network, an unknown DOI or a broken file only print a
 * warning. Failed lookups are not cached, so they are tried again on the next build.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/reading.yaml');
const CACHE = join(ROOT, '.cache/reading-meta.json');
const USER_AGENT = 'saswatanandi.github.io reading-list (https://saswatanandi.github.io)';
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 4;
const FIELDS = ['title', 'authors', 'venue', 'year'];

const log = (msg) => console.log(`reading-meta: ${msg}`);

/* ── Cleaning Crossref data ─────────────────────────────────────────────── */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—' };

/** Strip HTML/JATS tags (<i>, <sub>, <scp>, …), decode common entities, collapse whitespace. */
export function cleanText(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Keith J." → "K. J."; "Jean-Pierre" → "J.-P." */
function initials(given) {
  return cleanText(given)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .filter(Boolean)
        .map((part) => `${[...part.replace(/\./g, '')][0]?.toUpperCase() ?? ''}.`)
        .join('-'),
    )
    .join(' ');
}

/** Site style: "Beven, K." / "Beven, K. and Binley, A." / "Smith, J., Lee, K. and Rao, P." / "Smith, J. et al." */
export function formatAuthors(list) {
  const names = (Array.isArray(list) ? list : [])
    .map((a) => {
      if (a?.family) {
        const ini = a.given ? initials(a.given) : '';
        return ini ? `${cleanText(a.family)}, ${ini}` : cleanText(a.family);
      }
      return cleanText(a?.name ?? ''); // an organisation
    })
    .filter(Boolean);
  if (names.length === 0) return undefined;
  if (names.length >= 4) return `${names[0]} et al.`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function yearOf(work) {
  for (const key of ['issued', 'published-print', 'published-online', 'published']) {
    const y = work?.[key]?.['date-parts']?.[0]?.[0];
    if (Number.isInteger(y)) return y;
  }
  return undefined;
}

/** Crossref "message" → the fields the site uses (only the ones Crossref has). */
export function metaFromWork(work) {
  const title = cleanText([].concat(work?.title ?? [])[0]);
  const container = cleanText([].concat(work?.['container-title'] ?? [])[0]);
  const bookish = /book|monograph|report/.test(String(work?.type ?? ''));
  const venue = container || (bookish ? cleanText(work?.publisher) : '');
  const meta = {};
  if (title) meta.title = title;
  const authors = formatAuthors(work?.author ?? work?.editor);
  if (authors) meta.authors = authors;
  if (venue) meta.venue = venue;
  const year = yearOf(work);
  if (year) meta.year = year;
  return meta;
}

/* ── Network ────────────────────────────────────────────────────────────── */

class HttpError extends Error {}

async function lookup(doi) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res;
    try {
      res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: ctrl.signal,
      });
    } catch (err) {
      const reason = err?.name === 'AbortError' ? 'timed out' : (err?.cause?.code ?? err?.message ?? 'network error');
      throw Object.assign(new Error(String(reason)), { network: true });
    }
    if (!res.ok) throw new HttpError(res.status === 404 ? 'not found at Crossref' : `HTTP ${res.status}`);
    let body;
    try {
      body = await res.json();
    } catch {
      throw new HttpError('bad JSON from Crossref');
    }
    const meta = metaFromWork(body?.message);
    if (!meta.title) throw new HttpError('Crossref has no title for it');
    return meta;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main() {
  if (!existsSync(DATA)) return log('src/data/reading.yaml not found — nothing to do');

  let items;
  try {
    const { parse } = await import('yaml');
    items = parse(readFileSync(DATA, 'utf-8'));
  } catch (err) {
    // The site build reports YAML errors properly; here we just step aside.
    return log(`could not read src/data/reading.yaml (${String(err?.message ?? err).split('\n')[0]}) — skipped`);
  }
  if (!Array.isArray(items)) return;

  let cache = {};
  try {
    if (existsSync(CACHE)) cache = JSON.parse(readFileSync(CACHE, 'utf-8')) ?? {};
    if (typeof cache !== 'object' || Array.isArray(cache)) cache = {};
  } catch {
    log('.cache/reading-meta.json was unreadable — starting a new one');
    cache = {};
  }

  // DOIs that still need a lookup (deduplicated).
  const todo = new Set();
  const cachedDois = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || typeof item.doi !== 'string') continue;
    const doi = item.doi.trim();
    if (!/^10\.\d{4,9}\/\S+$/.test(doi)) continue; // the build will explain the problem
    if (FIELDS.every((f) => item[f] != null && item[f] !== '')) continue; // everything typed
    const key = doi.toLowerCase();
    if (cache[key]?.title) cachedDois.add(key);
    else todo.add(key);
  }

  let looked = 0;
  let failed = 0;
  let skipped = 0;
  let succeededOnce = false;
  let offline = '';
  const queue = [...todo];

  const worker = async () => {
    while (queue.length) {
      const doi = queue.shift();
      if (offline) {
        skipped++;
        continue;
      }
      try {
        const meta = await lookup(doi);
        cache[doi] = { ...meta, fetched: new Date().toISOString().slice(0, 10) };
        looked++;
        succeededOnce = true;
      } catch (err) {
        failed++;
        if (err?.network && !succeededOnce) offline = err.message;
        log(`could not look up ${doi} (${err?.message ?? err}) — will retry next build`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

  if (offline && skipped) log(`no connection to Crossref (${offline}) — skipped ${skipped} more, will retry next build`);

  if (looked > 0) {
    try {
      mkdirSync(dirname(CACHE), { recursive: true });
      const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
      writeFileSync(CACHE, `${JSON.stringify(sorted, null, 2)}\n`);
    } catch (err) {
      log(`could not save .cache/reading-meta.json (${err?.message ?? err})`);
    }
  }

  const parts = [`${looked} looked up`, `${cachedDois.size} cached`, `${failed} failed`];
  if (skipped) parts.push(`${skipped} skipped`);
  log(parts.join(', '));
}

// Only run when called as a script (the helpers above can be imported for testing).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
    .catch((err) => log(`unexpected problem (${err?.message ?? err}) — skipped`))
    .finally(() => {
      process.exitCode = 0;
    });
}
