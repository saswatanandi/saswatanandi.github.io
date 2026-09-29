import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { yamlLoader } from './lib/yaml-loader';
import {
  blogSchema,
  newsSchema,
  readingNoteSchema,
  readingSchema,
  researchSchema,
  softwareSchema,
} from './schemas/content';

/* Markdown ------------------------------------------------------------------ */

/** Blog posts: src/content/blog/<slug>/index.md (images live next to the post). */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: blogSchema,
});

/** Optional long-form notes for entries in reading.yaml. */
const readingNotes = defineCollection({
  loader: glob({ base: './src/content/reading/notes', pattern: '**/*.md' }),
  schema: readingNoteSchema,
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

const reading = defineCollection({
  loader: yamlLoader({ path: 'src/data/reading.yaml' }),
  schema: readingSchema,
});

const software = defineCollection({
  loader: yamlLoader({ path: 'src/data/software.yaml' }),
  schema: softwareSchema,
});

export const collections = { blog, readingNotes, research, news, reading, software };
