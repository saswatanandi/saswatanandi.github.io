// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  rehypeCallouts,
  rehypeCodeBlocks,
  rehypeFigures,
  rehypeHeadingAnchors,
  rehypeTables,
} from './src/lib/markdown-plugins.mjs';
import { redirects } from './src/lib/redirects.mjs';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://saswatanandi.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Leave out the 404 page and pages that only redirect (/cv/ → /cv.pdf, old /en/... addresses).
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.startsWith('/404') && !/^\/cv\/?$/.test(path) && !/^\/en(\/|$)/.test(path);
      },
    }),
  ],
  // /cv/ → /cv.pdf (the CV is a PDF only) and every old Hugo address (/en/...), see src/lib/redirects.mjs.
  // Astro writes a small page with a meta refresh, a canonical link and a visible link.
  redirects: { '/cv': '/cv.pdf', ...redirects },
  markdown: {
    // remark/rehype pipeline with maths (KaTeX, rendered at build time; the page loads only the
    // self-hosted CSS and fonts) and the small plugins in src/lib/markdown-plugins.mjs.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        [rehypeKatex, { strict: false, output: 'html' }],
        rehypeHeadingAnchors,
        rehypeFigures,
        rehypeCallouts,
        rehypeCodeBlocks,
        rehypeTables,
      ],
    }),
    shikiConfig: {
      // Two themes; CSS picks one from the site's light/dark mode (src/styles/prose.css).
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
      langAlias: { terminal: 'text', console: 'text', ipython: 'python', ipython3: 'python' },
    },
  },
  devToolbar: { enabled: false },
});
