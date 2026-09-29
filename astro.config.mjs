// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      // /cv/ only redirects to /cv.pdf.
      filter: (page) => !page.includes('/404') && !/\/cv\/?$/.test(page),
    }),
  ],
  // /cv/ → /cv.pdf (the CV is a PDF only). Old Hugo URLs (/en/...) are added in Phase 3.
  // Astro writes a small page with a meta refresh, a canonical link and a visible link.
  redirects: { '/cv': '/cv.pdf' },
  devToolbar: { enabled: false },
});
