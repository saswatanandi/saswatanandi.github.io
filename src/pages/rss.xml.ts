import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/collections';
import { site } from '../lib/config';

export const GET: APIRoute = async (context) => {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: `${site.name} — Blog`,
    description: `Notes on hydrology, climate data and open-source tools by ${site.name}.`,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
      categories: p.data.tags,
    })),
    customData: '<language>en</language>',
  });
};
