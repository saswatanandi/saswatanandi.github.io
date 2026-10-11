/**
 * Fills the gaps in reading.yaml entries from .cache/reading-meta.json, which scripts/reading-meta.mjs
 * writes from Crossref before dev/build. Only missing fields are filled: what you type always wins.
 * No cache file (or a broken one) simply means nothing is filled; the DOI is then shown as the title.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

type Item = Record<string, unknown>;
interface Meta {
  title?: string;
  authors?: string;
  venue?: string;
  year?: number;
}

const FIELDS = ['title', 'authors', 'venue', 'year'] as const;
const missing = (v: unknown) => v == null || v === '';

async function readCache(path: string): Promise<Record<string, Meta>> {
  try {
    const data: unknown = JSON.parse(await readFile(path, 'utf-8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, Meta>) : {};
  } catch {
    return {};
  }
}

/** Returns a `prepare` hook for yamlLoader that merges the cache (path relative to the project root). */
export function fillFromCache(cachePath: string) {
  return async (items: Item[], root: URL): Promise<Item[]> => {
    const cache = await readCache(fileURLToPath(new URL(cachePath, root)));
    return items.map((item) => {
      if (typeof item.doi !== 'string') return item;
      const meta = cache[item.doi.trim().toLowerCase()];
      if (!meta) return item;
      const out: Item = { ...item };
      for (const f of FIELDS) if (missing(out[f]) && !missing(meta[f])) out[f] = meta[f];
      return out;
    });
  };
}
