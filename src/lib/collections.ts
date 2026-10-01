/** Collection helpers: draft handling and sorting in one place. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';
import softwareYaml from '../data/software.yaml?raw';
import { listIds } from './yaml-loader';

/** Drafts are visible in `npm run dev` only. */
const visible = (draft: boolean) => import.meta.env.DEV || !draft;

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => visible(data.draft));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Reading entries, newest `read` month first. Checks that every `note:` names a file in
 * src/content/reading/notes/ and that every published note is linked from an entry.
 */
export async function getReading(): Promise<CollectionEntry<'reading'>[]> {
  const items = await getCollection('reading', ({ data }) => visible(data.draft));
  const notes = await getCollection('readingNotes');
  const noteIds = new Set(notes.map((n) => n.id));
  for (const r of items) {
    if (r.data.note && !noteIds.has(r.data.note)) {
      throw new Error(
        `\n✖ src/data/reading.yaml: "${r.data.title}" has note: ${r.data.note}, but there is no file ` +
          `src/content/reading/notes/${r.data.note}.md. Check the spelling or add the file.\n`,
      );
    }
  }
  const linked = new Set(items.map((r) => r.data.note).filter(Boolean));
  for (const n of notes) {
    if (!n.data.draft && !linked.has(n.id)) {
      throw new Error(
        `\n✖ src/content/reading/notes/${n.id}.md is not linked from any entry in src/data/reading.yaml. ` +
          `Add "note: ${n.id}" to the paper's entry (or set draft: true in the note).\n`,
      );
    }
  }
  // A note set to draft: true is hidden, so drop its "Read note" link instead of pointing at a missing page.
  const hiddenNotes = new Set(notes.filter((n) => !visible(n.data.draft)).map((n) => n.id));
  const withLinks = items.map((r) =>
    r.data.note && hiddenNotes.has(r.data.note) ? { ...r, data: { ...r.data, note: undefined } } : r,
  );
  return withLinks.sort((a, b) => b.data.read.localeCompare(a.data.read) || a.data.title.localeCompare(b.data.title));
}

/** A reading entry with its note, for the note pages /reading/<note>/. Drafts follow `visible`. */
export async function getReadingNotes(): Promise<{ entry: CollectionEntry<'reading'>; note: CollectionEntry<'readingNotes'> }[]> {
  const items = await getReading();
  const notes = await getCollection('readingNotes', ({ data }) => visible(data.draft));
  const byId = new Map(notes.map((n) => [n.id, n]));
  return items.flatMap((entry) => {
    const note = entry.data.note ? byId.get(entry.data.note) : undefined;
    return note ? [{ entry, note }] : [];
  });
}

export async function getNews(): Promise<CollectionEntry<'news'>[]> {
  const items = await getCollection('news', ({ data }) => visible(data.draft));
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getThemes(): Promise<CollectionEntry<'research'>[]> {
  const items = await getCollection('research');
  return items.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Software in the order of software.yaml, featured first. Checks that `page: true` items have a text file. */
export async function getSoftware(): Promise<CollectionEntry<'software'>[]> {
  const items = await getCollection('software');
  const pages = new Set((await getCollection('softwarePages')).map((p) => p.id));
  for (const s of items) {
    if (s.data.page && !pages.has(s.id)) {
      throw new Error(
        `\n✖ src/data/software.yaml: ${s.data.name} has page: true, but src/content/software/${s.id}.md does not exist.\n`,
      );
    }
  }
  // getCollection does not keep the order of the file, so sort by the position in software.yaml.
  const position = new Map(listIds(parse(softwareYaml) ?? []).map((id, i) => [id, i]));
  const at = (s: CollectionEntry<'software'>) => position.get(s.id) ?? Infinity;
  return items.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || at(a) - at(b));
}

/** Where a reading entry links: its DOI, else its url. */
export const readingHref = (r: CollectionEntry<'reading'>) =>
  r.data.doi ? `https://doi.org/${r.data.doi}` : r.data.url;
