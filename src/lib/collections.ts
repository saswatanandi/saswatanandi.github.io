/** Collection helpers: draft handling and sorting in one place. */
import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts are visible in `npm run dev` only. */
const visible = (draft: boolean) => import.meta.env.DEV || !draft;

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => visible(data.draft));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getReading(): Promise<CollectionEntry<'reading'>[]> {
  const items = await getCollection('reading', ({ data }) => visible(data.draft));
  return items.sort((a, b) => b.data.read.localeCompare(a.data.read) || a.data.title.localeCompare(b.data.title));
}

export async function getNews(): Promise<CollectionEntry<'news'>[]> {
  const items = await getCollection('news', ({ data }) => visible(data.draft));
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getThemes(): Promise<CollectionEntry<'research'>[]> {
  const items = await getCollection('research');
  return items.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export async function getSoftware(): Promise<CollectionEntry<'software'>[]> {
  const items = await getCollection('software');
  return items.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.name.localeCompare(b.data.name));
}
