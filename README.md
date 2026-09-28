# saswatanandi.github.io

Personal academic website of **Saswata Nandi** — built with [Astro](https://astro.build), own "Topographic" theme, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Everyday edits (no local setup needed — edit on GitHub, commit, done)

| I want to change…                     | Edit                                   |
| ------------------------------------- | -------------------------------------- |
| Name, title, affiliation, bio, links, nav, citation metrics, analytics | `site.config.yaml` |
| News on the home page                 | `src/data/news.yaml`                   |
| Publications (list, paper pages, home "Selected") | `src/data/publications.bib` — see below |
| Software cards / IMDLIB stats         | `src/data/software.yaml`               |
| Reading list                          | `src/data/reading.yaml` (+ notes in `src/content/reading/notes/`) |
| Research themes (text, picture) | `src/content/research/<slug>.md` — see below |
| Blog posts                            | `src/content/blog/<slug>/index.md` (copy `example-post/`) |
| CV entries                            | `src/data/cv.yaml`                     |
| Headshot / social card                | `public/images/headshot.jpg`, `public/og-default.png` |

Every file is validated at build time: a typo produces an error naming the file and field
(see the "Build" step log in the Actions tab). Set `draft: true` to hide an item on the live site.

## Publications

Everything comes from **one file, `src/data/publications.bib`**. `/publications/` (tabs by type, year and
theme filters), each paper's page `/publications/<key>/`, "Selected papers" on the home page, the theme
pages and the CV all read from it.

**Add a paper:**

1. Get its BibTeX from Google Scholar (Cite → BibTeX), Zotero, or `https://doi.org/<doi>`
   (for example `curl -LH "Accept: application/x-bibtex" https://doi.org/10.1029/…`).
2. Paste it into `publications.bib` and add:
   - `pubtype = {journal}`: sets the tab. `journal` (Journal articles), `chapter` (Book chapters),
     `proceedings` (Conference papers), `abstract` or `talk` (Talks & abstracts).
   - `topic = {fire-and-water, climate-extremes}`: research themes (file names in `src/content/research/`).
   - optional: `selected = {true}` (home page), `pdf`, `code`, `data`, `slides` (links become buttons),
     `summary` (plain-language sentence), `abstract`, `image` + `image_alt` (a figure in `public/`).
3. Commit. The key (e.g. `nandi2024imdlib`) becomes the page URL, so keep it once published.

A ready-to-copy example is in `templates/new-paper.bib`, and the header of `publications.bib` explains
every field. Your name is bolded automatically (last name "Nandi", first initial "S", set in `src/lib/bibtex.ts`).
"Copy BibTeX" gives visitors the entry without the site-only fields (`pubtype`, `topic`, `abstract`, …).
Each paper page carries Google Scholar `citation_*` tags and schema.org data.

**Badges:** papers with a DOI show an Altmetric donut and a Dimensions citation badge. They load from
those services only when scrolled into view, and empty ones hide themselves. Switch them off in
`site.config.yaml`:

```yaml
publications:
  badges:
    altmetric: true    # false = off
    dimensions: true
```

The citations / h-index / i10 numbers at the top of `/publications/` (and on the home page) are the
`metrics:` block in `site.config.yaml`, entered by hand. `docs/publications-notes.md` lists what to check
after the conversion from `publication.txt`.

## Research themes

One Markdown file per theme in `src/content/research/`; the file name is the theme's slug
(used in the URL and in the BibTeX `topic` field, e.g. `topic = {fire-and-water, climate-extremes}`,
see `docs/topic-mapping.md`). Papers tagged with a theme are listed on its page automatically.

**Where the pictures go:** put a line `<!-- figure -->` in the theme text where the main picture (`image:`)
should appear. A theme can have more pictures in a `figures:` list (each with `image`, `alt`, optional
`caption` and `full`); place them with `<!-- figure 2 -->`, `<!-- figure 3 -->`, … Any picture without
a marker goes after the text; a marker with no matching picture stops the build with a clear message. The `summary` is used on cards (home and /research/), not on the theme page.

**Swapping a theme picture:** put your file in `src/assets/research/` and set `image:` to its name.

- `.png` / `.jpg` / `.webp` — photos, maps, plots (resized and optimised automatically).
- `.svg` — drawn inline; use `currentColor` or the site colours (`var(--color-accent)`, …) so it follows dark mode.
  An optional phone version `name.narrow.svg` next to it replaces it when the figure is narrower than 30rem.
- Update `image_alt` (what the picture shows, for screen readers) and optionally `image_caption`.
- The home-page card uses `thumbnail:` if set, otherwise `image` (text labels in inline SVGs are hidden on cards).
- `image_full:` adds a "View full diagram" link (e.g. `/images/research/cwis-flowchart.png` in `public/`).

The CWIS workflow on theme 2 is an HTML component (`image: cwis-pipeline`,
wording in `src/components/research/CwisPipeline.astro`); replace it with an image file name the same way.
`collaborators` and `funding` are optional; empty ones are hidden. (`feature` is kept as data but not shown.)

The theme-2 model-chain drawing is generated: `node scripts/figures/make-india-svg.mjs` rewrites
`src/assets/research/model-chain-india{,.narrow}.svg`.

The theme-3 map (atmospheric river, ENSO, PDO) is generated too: `node scripts/figures/make-ar-map.mjs`
rewrites `src/assets/research/climate-extremes{,.narrow}.svg` and `climate-extremes-card.svg`. Coastlines are
Natural Earth (public domain, via `world-atlas`), state lines US Census (public domain, via `us-atlas`); the IVT
and SST-anomaly fields are synthetic, drawn for illustration.

## CV (web page + PDF)

`src/data/cv.yaml` holds positions, education, grants, awards, talks, teaching, mentoring, service,
skills, languages and memberships (instructions and examples are at the top of the file; empty
sections are hidden). Publications are added automatically from `publications.bib`, grouped as
journal articles, book chapters, proceedings and abstracts, numbered newest first (J16 … J1).

- `/cv/` renders it; `/cv.pdf` is typeset with [Typst](https://typst.app) from the same data.
- The PDF is **generated, not committed**: GitHub Actions runs `npm run cv:pdf` before every build.
  Locally, install Typst ≥ 0.12 (e.g. `brew install typst`, or a binary from its GitHub releases)
  and run `npm run cv:pdf` → `public/cv.pdf` (git-ignored). Without it, `/cv/` shows "PDF coming soon".
- Paper size: `pdf.paper` in cv.yaml (`us-letter` or `a4`), or for a one-off copy:
  `npm run cv:data && typst compile --font-path cv/fonts --input paper=a4 cv/cv.typ cv-a4.pdf`.
- Design: `cv/cv.typ`; fonts: `cv/fonts/` (Source Serif 4 + Inter, SIL OFL); shared section logic:
  `src/lib/cv.ts`; schema: `src/schemas/cv.ts`; data step: `scripts/build-cv-data.mjs`.

## Local development

```sh
nvm use          # Node 22 (see .nvmrc)
npm ci
npm run dev      # http://localhost:4321 (drafts visible)
npm run build    # production build → dist/
npm run preview  # serve dist/
npm run check    # type-check .astro/.ts files
npm run cv:pdf   # CV → public/cv.pdf (needs Typst)
```

## Where things live

- `src/styles/tokens.css` — colours (light + dark), type scale, spacing
- `src/lib/contours.ts` — the generated contour-line motif (marching squares, seeded)
- `src/content.config.ts`, `src/schemas/` — Zod schemas for all content
- `src/lib/bibtex.ts` — BibTeX → publication objects (`@retorquere/bibtex-parser`)
- `.github/workflows/deploy.yml` — build & deploy
