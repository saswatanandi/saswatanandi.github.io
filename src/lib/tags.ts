/**
 * Shared tags: one page per tag (/tags/<slug>/) listing blog posts and reading entries.
 * Tags are compared by slug, so "Remote Sensing" and "remote-sensing" are the same tag.
 */
import { getCollection } from 'astro:content';
import { tagSlug, type Post } from './blog';
import { READING_TYPE_LABEL, getPosts } from './collections';

interface ReadingItem {
  title: string;
  /** "Paper", "Blog", "Report" or "Book". */
  kind: string;
  /** Note page on this site, else the DOI or URL, else /reading/. */
  href: string;
  external: boolean;
  source: string;
  why?: string;
  read: string;
}

export interface Tag {
  slug: string;
  label: string;
  posts: Post[];
  reading: ReadingItem[];
  count: number;
}

const visible = (draft: unknown) => import.meta.env.DEV || draft !== true;

/** Reading entries with their tags (tags live only on the entry in reading.yaml). Read-only use of the reading data. */
async function readingItems(): Promise<{ item: ReadingItem; tags: string[] }[]> {
  const entries = await getCollection('reading', ({ data }) => visible(data.draft));
  const notes = await getCollection('readingNotes', ({ data }) => visible(data.draft));
  const noteById = new Map(notes.map((n) => [n.id, n]));
  const postIds = new Set((await getCollection('blog', ({ data }) => visible(data.draft))).map((p) => p.id));
  return entries
    .map(({ data }) => {
      // Loose access: the reading data format may gain or rename fields.
      const r = data as Record<string, unknown> & typeof data;
      const noteId = typeof r.note === 'string' ? r.note : undefined;
      const note = noteId ? noteById.get(noteId) : undefined;
      const doi = typeof r.doi === 'string' ? r.doi : undefined;
      const url = typeof r.url === 'string' ? r.url : undefined;
      const venue = (r.venue ?? r.journal) as string | undefined;
      const post = typeof r.post === 'string' && postIds.has(r.post) ? r.post : undefined;
      const href = note ? `/reading/${note.id}/` : post ? `/blog/${post}/` : doi ? `https://doi.org/${doi}` : (url ?? '/reading/');
      return {
        item: {
          title: String(r.title),
          kind: READING_TYPE_LABEL[r.type as keyof typeof READING_TYPE_LABEL] ?? 'Paper',
          href,
          external: /^https?:/.test(href),
          source: [r.authors, venue, r.year].filter(Boolean).join(' · '),
          why: typeof r.why === 'string' ? r.why : undefined,
          read: String(r.read ?? ''),
        },
        tags: (r.tags as string[] | undefined) ?? [],
      };
    })
    .sort((a, b) => b.item.read.localeCompare(a.item.read));
}

export async function getTags(): Promise<Tag[]> {
  const map = new Map<string, Tag>();
  const get = (label: string) => {
    const slug = tagSlug(label);
    if (!slug) return undefined;
    let t = map.get(slug);
    if (!t) map.set(slug, (t = { slug, label: label.trim().toLowerCase(), posts: [], reading: [], count: 0 }));
    return t;
  };
  for (const p of await getPosts()) {
    for (const slug of new Set(p.data.tags.map(tagSlug))) {
      const t = get(p.data.tags.find((x) => tagSlug(x) === slug)!);
      if (t) t.posts.push(p);
    }
  }
  for (const { item, tags } of await readingItems()) {
    for (const slug of new Set(tags.map(tagSlug))) {
      const t = get(tags.find((x) => tagSlug(x) === slug)!);
      if (t) t.reading.push(item);
    }
  }
  for (const t of map.values()) t.count = t.posts.length + t.reading.length;
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}
