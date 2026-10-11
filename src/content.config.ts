import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fillFromCache } from './lib/reading-meta';
import { slugify, yamlLoader } from './lib/yaml-loader';
import {
  blogSchema,
  newsSchema,
  readingNoteSchema,
  readingSchema,
  researchSchema,
  softwarePageSchema,
  softwareSchema,
} from './schemas/content';

/* Markdown ------------------------------------------------------------------ */

/**
 * Blog posts: src/content/blog/<slug>/index.md (images live next to the post).
 * Notebook posts: <slug>/index.ipynb is converted to <slug>/index.ipynb.md by scripts/notebooks.mjs
 * (runs before dev/build). Either way the folder name is the URL: /blog/<slug>/.
 */
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md',
    generateId: ({ entry }) =>
      entry
        .replace(/\/index(\.ipynb)?\.md$/, '')
        .replace(/\.md$/, '')
        .toLowerCase(),
  }),
  schema: blogSchema,
});

/** Optional long-form notes for entries in reading.yaml. */
const readingNotes = defineCollection({
  loader: glob({ base: './src/content/reading/notes', pattern: '**/*.md' }),
  schema: readingNoteSchema,
});

/** Detail pages for software.yaml items with `page: true`: src/content/software/<slug>.md */
const softwarePages = defineCollection({
  loader: glob({ base: './src/content/software', pattern: '*.md' }),
  schema: softwarePageSchema,
});

/** Research themes: src/content/research/<slug>.md */
const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '*.md' }),
  schema: researchSchema,
});

/* YAML data ------------------------------------------------------------------ */

const news = defineCollection({
  loader: yamlLoader({
    path: 'src/data/news.yaml',
    id: (item, i) => `${String(item.date ?? 'undated')}-${i + 1}`,
  }),
  schema: newsSchema,
});

/**
 * Reading list. Entries with only a DOI get title/authors/venue/year from .cache/reading-meta.json
 * (written from Crossref by scripts/reading-meta.mjs before dev/build); typed fields always win.
 * Ids come from what is typed: title, else DOI, else url.
 */
const reading = defineCollection({
  loader: yamlLoader({
    path: 'src/data/reading.yaml',
    id: (item, i) => {
      for (const key of ['title', 'doi', 'url']) {
        const v = item[key];
        if (typeof v === 'string' && v.trim()) return slugify(v);
      }
      return String(i + 1);
    },
    prepare: fillFromCache('.cache/reading-meta.json'),
  }),
  schema: readingSchema,
});

const software = defineCollection({
  loader: yamlLoader({ path: 'src/data/software.yaml' }),
  schema: softwareSchema,
});

export const collections = { blog, readingNotes, research, news, reading, software, softwarePages };
