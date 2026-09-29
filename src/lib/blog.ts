/** Blog helpers: reading time, tag slugs, series, neighbours. */
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Posts per page on /blog/ (pages /blog/page/2/, … appear only when there are more). */
export const POSTS_PER_PAGE = 20;

/** Minutes to read: prose at 220 words a minute, code blocks at a third of that. */
export function readingTime(body = ''): number {
  const code = body.match(/```[\s\S]*?```/g) ?? [];
  const codeWords = code.join(' ').split(/\s+/).filter(Boolean).length;
  const prose = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = prose.split(/\s+/).filter((w) => /\w/.test(w)).length;
  return Math.max(1, Math.round(words / 220 + codeWords / 660));
}

/** "Climate Data" → "climate-data" (used in /tags/<slug>/). */
export const tagSlug = (tag: string) =>
  tag
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const tagHref = (tag: string) => `/tags/${tagSlug(tag)}/`;

/** Posts in the same series as `post`, oldest first (empty if it has no series). */
export function seriesOf(post: Post, posts: Post[]): Post[] {
  const name = post.data.series;
  if (!name) return [];
  return posts.filter((p) => p.data.series === name).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
}
