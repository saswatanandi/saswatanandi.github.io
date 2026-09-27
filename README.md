# saswatanandi.github.io

Personal academic website of **Saswata Nandi** — built with [Astro](https://astro.build), own "Topographic" theme, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Everyday edits (no local setup needed — edit on GitHub, commit, done)

| I want to change…                     | Edit                                   |
| ------------------------------------- | -------------------------------------- |
| Name, title, affiliation, bio, links, nav, citation metrics, analytics | `site.config.yaml` |
| News on the home page                 | `src/data/news.yaml`                   |
| Publications (and "selected" on home) | `src/data/publications.bib` (`selected = {true}`) |
| Software cards / IMDLIB stats         | `src/data/software.yaml`               |
| Reading list                          | `src/data/reading.yaml` (+ notes in `src/content/reading/notes/`) |
| Research themes                       | `src/content/research/*.md`            |
| Blog posts                            | `src/content/blog/<slug>/index.md` (copy `example-post/`) |
| CV entries                            | `src/data/cv.yaml`                     |
| Headshot / social card                | `public/images/headshot.jpg`, `public/og-default.png` |

Every file is validated at build time: a typo produces an error naming the file and field
(see the "Build" step log in the Actions tab). Set `draft: true` to hide an item on the live site.

## Local development

```sh
nvm use          # Node 22 (see .nvmrc)
npm ci
npm run dev      # http://localhost:4321 (drafts visible)
npm run build    # production build → dist/
npm run preview  # serve dist/
npm run check    # type-check .astro/.ts files
```

## Where things live

- `src/styles/tokens.css` — colours (light + dark), type scale, spacing
- `src/lib/contours.ts` — the generated contour-line motif (marching squares, seeded)
- `src/content.config.ts`, `src/schemas/` — Zod schemas for all content
- `src/lib/bibtex.ts` — BibTeX → publication objects (`@retorquere/bibtex-parser`)
- `.github/workflows/deploy.yml` — build & deploy
