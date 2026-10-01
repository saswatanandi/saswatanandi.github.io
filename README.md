# saswatanandi.github.io

Personal academic website of **Saswata Nandi** — built with [Astro](https://astro.build), own "Topographic" theme, deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Everyday edits (no local setup needed — edit on GitHub, commit, done)

Step-by-step instructions for each kind of update are in **[HOW-TO-UPDATE.md](HOW-TO-UPDATE.md)**.

| I want to change…                     | Edit                                   |
| ------------------------------------- | -------------------------------------- |
| Name, title, affiliation, bio, links, nav, citation metrics, analytics | `site.config.yaml` |
| News on the home page                 | `src/data/news.yaml`                   |
| Publications (list, paper pages, home "Selected") | `src/data/publications.bib` — see below |
| Software (packages, dashboards) / IMDLIB stats | `src/data/software.yaml`     |
| Reading list                          | `src/data/reading.yaml` (+ notes in `src/content/reading/notes/`) |
| Research themes (text, picture) | `src/content/research/<slug>.md` — see below |
| Blog posts                            | `src/content/blog/<slug>/index.md` (copy `example-post/`) or `index.ipynb` (see below) |
| CV (the PDF at /cv.pdf)               | `src/data/cv.yaml`                     |
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
every field. Your name is bolded automatically (last name "Nandi", first initial "S", set in `src/lib/pubcore.ts`).
"Copy BibTeX" gives visitors the entry without the site-only fields (`pubtype`, `topic`, `abstract`, …).
Each paper page carries Google Scholar `citation_*` tags and schema.org data.

**Badges:** each paper's own page shows an Altmetric donut and a Dimensions citation badge (papers with a DOI). They load from
those services only when scrolled into view, and empty ones hide themselves. Switch them off in
`site.config.yaml`:

```yaml
publications:
  badges:
    altmetric: true    # false = off
    dimensions: true
    in_list: false     # true = also show them in the /publications/ list
```

The citations / h-index / i10 numbers at the top of `/publications/` are the
`metrics:` block in `site.config.yaml`, entered by hand. `docs/publications-notes.md` lists what to check
after the conversion from `publication.txt`.

## Research themes

One Markdown file per theme in `src/content/research/`; the file name is the theme's slug
(used in the URL and in the BibTeX `topic` field, e.g. `topic = {fire-and-water, climate-extremes}`,
see `docs/topic-mapping.md`). Papers tagged with a theme are listed on its page automatically.

**Where the pictures go:** put a line `<!-- figure -->` in the theme text where the main picture (`image:`)
should appear. A theme can have more pictures in a `figures:` list (each with `image`, `alt` and an optional
`caption`); place them with `<!-- figure 2 -->`, `<!-- figure 3 -->`, … Any picture without
a marker goes after the text; a marker with no matching picture stops the build with a clear message. The `summary` is used on cards (home and /research/), not on the theme page.

**Swapping a theme picture:** put your file in `src/assets/research/` and set `image:` to its name.

- `.png` / `.jpg` / `.webp` — photos, maps, plots (resized and optimised automatically).
- `.svg` — drawn inline; use `currentColor` or the site colours (`var(--color-accent)`, …) so it follows dark mode.
  An optional phone version `name.narrow.svg` next to it replaces it when the figure is narrower than 30rem.
- Update `image_alt` (what the picture shows, for screen readers) and optionally `image_caption`.
- The home-page card uses `thumbnail:` if set, otherwise `image` (text labels in inline SVGs are hidden on cards).

The CWIS workflow on theme 2 is an HTML component (`image: cwis-pipeline`,
wording in `src/components/research/CwisPipeline.astro`); replace it with an image file name the same way.
`collaborators` and `funding` are optional; empty ones are hidden.

The theme-2 model-chain drawing is generated: `node scripts/figures/make-india-svg.mjs` rewrites
`src/assets/research/model-chain-india{,.narrow}.svg`.

The theme-3 map (atmospheric river, ENSO, PDO) is generated too: `node scripts/figures/make-ar-map.mjs`
rewrites `src/assets/research/climate-extremes{,.narrow}.svg` and `climate-extremes-card.svg`. Coastlines are
Natural Earth (public domain, via `world-atlas`), state lines US Census (public domain, via `us-atlas`); the IVT
and SST-anomaly fields are synthetic, drawn for illustration.

## Reading

`/reading/` lists papers from **`src/data/reading.yaml`**, grouped by the month you read them, with a tag filter.
Until the file has a published entry, the page says "Nothing here yet".

**Adding a paper to Reading:**

1. Copy the block in `templates/reading-entry.yaml` to the top of `src/data/reading.yaml`.
2. Fill in `title`, `authors`, `year`, `read` (e.g. `2026-10`), `why` (one line) and `tags`.
   Add `venue` and `doi` (or `url`) if there are any. All fields are typed by hand; nothing is fetched.
3. For a longer note, add `note: surname-2025` and write `src/content/reading/notes/surname-2025.md`
   (front matter: optional `tags`, `date`, `title`; then Markdown). It appears at `/reading/surname-2025/`
   and the entry gets a "Read note →" link.

A `note:` with no matching file, or a note file that no entry links to, stops the build with a message.
The newest entry also shows on the home page under "Blog and reading".

## Software

Cards on `/software/` and the IMDLIB block on the home page come from **`src/data/software.yaml`**
(fields explained at the top of the file). The page has two sections, each shown only when it has entries:
**Packages** (the default; badges, install line, repository/docs/PyPI buttons, the `featured: true` package
as a large card with a code panel) and **Dashboards** (`kind: dashboard`: name, optional `subtitle`,
description and one "Open <name> ↗" button to the required `website`). Cards keep the order of the file.
`page: true` adds a page `/software/<slug>/` whose text is
`src/content/software/<slug>.md`; the badges, buttons, citation, license and links on it come from the YAML.
Stars and downloads are typed by hand with an `as_of` date. `docs/software-notes.md` records what was checked.

## CV (PDF only)

The CV is a PDF at `/cv.pdf` (the nav "CV" link and the home-page button point there; the old
`/cv/` address redirects to it). It is typeset with [Typst](https://typst.app) from:

- `src/data/cv.yaml`: positions, education, grants, honours, software, teaching, mentoring, service,
  press, skills, … (instructions and examples at the top of the file; empty sections are hidden);
- `site.config.yaml`: name, role, affiliation, contact links;
- `src/data/publications.bib`: grouped as journal articles, book chapters, conference papers and
  abstracts, each group numbered 1, 2, 3 … from the newest.

Publications are read by **one shared module**, `src/lib/pubcore.ts` (parsing, validation, sorting,
owner-name bolding, author/venue formatting). The website (`src/lib/bibtex.ts`) and the PDF step both
use it, so the site and the PDF always agree.

- **On GitHub**: nothing to do. Every deploy installs Typst and runs `npm run cv:pdf` before the build;
  a mistake in `cv.yaml` or `publications.bib` stops the deploy with a message naming the file and field.
- **On your Mac**: `brew install typst` once, then `npm run cv:pdf` → `public/cv.pdf`
  (git-ignored; `npm run dev` then serves it at `/cv.pdf`).
- Paper size: `pdf.paper` in cv.yaml (`us-letter` or `a4`), or for a one-off copy:
  `npm run cv:data && typst compile --font-path cv/fonts --input paper=a4 cv/cv.typ cv-a4.pdf`.
- Design: `cv/cv.typ`; fonts: `cv/fonts/` (Source Serif 4 + Inter, SIL OFL); sections: `src/lib/cv.ts`;
  schema: `src/schemas/cv.ts`; data step: `scripts/build-cv-data.mjs` (writes `cv/build/cv-data.json`).

## Blog

One folder per post: `src/content/blog/<slug>/index.md`, pictures next to it. The folder name is the
address (`/blog/<slug>/`). Copy `src/content/blog/example-post/`; its front matter lists every field
(`title`, `description`, `date`, `tags`, optional `updated`, `series`, `cover` + `cover_alt`, `toc`,
`comments`, `draft`).

- **Maths:** `$...$` inline, `$$ ... $$` on their own lines for display (KaTeX, rendered at build time).
- **Code:** fenced blocks with a language (```` ```python ````) are highlighted and get a Copy button.
- **Pictures:** `![What it shows](./figure.png "Caption")`; the caption is optional.
- **Note boxes:** a quote starting with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`.
- **Contents list:** automatic for posts with three or more sections (`##`/`###`).
- **Series:** posts with the same `series:` name link to each other.
- **Tags:** every tag has a page (`/tags/<tag>/`) listing posts and reading entries with that tag.

**Jupyter notebook posts:** put `index.ipynb` in the post folder instead of `index.md`. The first cell
must be a Markdown cell holding the front matter between `---` lines (or put it in `meta.yaml` next to
the notebook). Save the notebook with its outputs: the site uses the saved outputs and runs nothing.
`scripts/notebooks.mjs` turns it into `index.ipynb.md` plus `nb-output/` pictures before every
`npm run dev` / `npm run build` (both git-ignored; commit only the notebook). Cell tags `remove-cell`,
`remove-input` and `remove-output` hide parts. Example: `src/content/blog/example-notebook/` (a draft).

**Comments (giscus):** off until set up. Enable Discussions on the repository, install the giscus app
(https://github.com/apps/giscus), pick a category at https://giscus.app and copy `repo`, `repo_id`,
`category` and `category_id` into `site.config.yaml` → `giscus`. `comments: false` in a post hides them there.

**RSS:** `/rss.xml` lists all published posts.

## Search

The search button in the header (shortcut `/`) uses [Pagefind](https://pagefind.app). The index is
built after the site by `npm run build` (settings in `pagefind.yml`), so search works on the built site
(`npm run build && npm run preview`), not in `npm run dev`. Only the main content of pages is indexed;
blog lists, tag pages and the 404 page are left out (`search={false}` on the layout).

## Old addresses

Every address of the old Hugo site (`/en/...`) redirects to its new page: see `docs/redirects.md`
(map in `src/lib/redirects.mjs`). `docs/migration-notes.md` lists what changed in the three old posts.

## Local development

```sh
nvm use          # Node 22 (see .nvmrc)
npm ci
npm run dev      # http://localhost:4321 (drafts visible)
npm run build    # production build → dist/
npm run preview  # serve dist/
npm run check    # type-check .astro/.ts files
npm run cv:pdf   # CV → public/cv.pdf (needs Typst: brew install typst)
```

## Where things live

- `src/styles/tokens.css` — colours (light + dark), type scale, spacing
- `src/lib/ridgelines.ts` — the hydrograph ridgelines under the page headers (seeded)
- `src/content.config.ts`, `src/schemas/` — Zod schemas for all content
- `src/lib/pubcore.ts` — BibTeX → publication objects (`@retorquere/bibtex-parser`), shared by site and CV PDF;
  `src/lib/bibtex.ts` adds the website bits
- `.github/workflows/deploy.yml` — build & deploy
