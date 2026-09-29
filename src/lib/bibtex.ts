/**
 * Publications for the website: reads `src/data/publications.bib` with the shared rules in
 * ./pubcore.ts (also used by the PDF CV) and adds web helpers (tabs, citation text).
 *
 * Used by the home page, /publications/, per-paper pages and research theme pages.
 */
import raw from '../data/publications.bib?raw';
import { TOPICS } from '../schemas/content';
import { PUB_GROUPS, readPublications, type Publication, type PubGroupId, type PubType } from './pubcore';

export * from './pubcore';

let cache: Publication[] | undefined;

/** All publications, newest first (year, then month, then title). */
export function getPublications(): Publication[] {
  cache ??= readPublications(raw, { topics: TOPICS });
  return cache;
}

export function getSelectedPublications(): Publication[] {
  return getPublications().filter((p) => p.selected);
}

export function getPublication(key: string): Publication | undefined {
  return getPublications().find((p) => p.key === key);
}

/** Which /publications/ tab a publication belongs to. */
export function groupOf(p: Publication): PubGroupId {
  return PUB_GROUPS.find((g) => (g.types as readonly PubType[]).includes(p.pubtype))!.id;
}
