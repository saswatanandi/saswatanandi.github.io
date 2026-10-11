/**
 * Share cards: /og/<section>/<id>.jpg for every blog post, reading note, software page and
 * publication page, drawn at build time (src/lib/og-card.ts). Other pages use /og-default.png.
 * Picture on the card: blog `social_image`, else `cover`; a publication's `image` (a file in
 * public/); otherwise the ridgeline pattern.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublications, type Publication } from '../../lib/bibtex';
import { getPosts, getReadingNotes, getSoftware } from '../../lib/collections';
import { site } from '../../lib/config';
import { renderCard, type CardInput } from '../../lib/og-card';

type Card = Omit<CardInput, 'name' | 'domain' | 'seed'>;

/** File path of an image imported through the content schema's image() helper. */
const fsPathOf = (img: unknown): string | undefined => {
  const p = (img as { fsPath?: string } | undefined)?.fsPath;
  return p && existsSync(p) ? p : undefined;
};
/** A publication picture that is a file in public/ (remote pictures are not fetched at build time). */
const publicFile = (src?: string): string | undefined => {
  if (!src || !src.startsWith('/')) return undefined;
  const p = join(process.cwd(), 'public', decodeURI(src.split(/[?#]/)[0]!));
  return existsSync(p) ? p : undefined;
};
const shorten = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const pubKicker = (p: Publication) =>
  [p.pubtype === 'talk' ? 'Talk' : p.pubtype === 'abstract' ? 'Abstract' : 'Paper', p.venue && shorten(p.venue, 48), String(p.year)]
    .filter(Boolean)
    .join(' · ');

export const getStaticPaths = (async () => {
  const paths: { params: { slug: string }; props: { card: Card } }[] = [];
  for (const post of await getPosts()) {
    const d = post.data;
    paths.push({
      params: { slug: `blog/${post.id}` },
      props: { card: { title: d.title, kicker: 'Blog', image: fsPathOf(d.social_image ?? d.cover) } },
    });
  }
  for (const { entry, note } of await getReadingNotes()) {
    paths.push({
      params: { slug: `reading/${note.id}` },
      props: { card: { title: note.data.title ?? entry.data.title, kicker: 'Reading' } },
    });
  }
  for (const item of (await getSoftware()).filter((s) => s.data.page)) {
    const s = item.data;
    paths.push({
      params: { slug: `software/${item.id}` },
      props: { card: { title: s.name, kicker: 'Software', subtitle: s.tagline ?? s.description } },
    });
  }
  for (const pub of getPublications()) {
    paths.push({
      params: { slug: `publications/${pub.key}` },
      props: { card: { title: pub.title, kicker: pubKicker(pub), image: publicFile(pub.image) } },
    });
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, params, site: siteUrl }) => {
  const { card } = props as { card: Card };
  const png = await renderCard({
    ...card,
    name: site.name,
    domain: siteUrl ? siteUrl.host : '',
    seed: params.slug ?? card.title,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/jpeg' } });
};
