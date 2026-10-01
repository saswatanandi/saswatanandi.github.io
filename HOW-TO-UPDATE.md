# How to update the site

Every change is an edit to a text file in this repository. When you commit to `main`, GitHub
builds the site and publishes it in about two minutes. If a file has a mistake, the build stops,
the log names the file and the field, and the live site stays as it was until you fix it.

## Contents

1. [How editing works](#how-editing-works)
2. [Add a paper](#add-a-paper)
3. [Add a news item](#add-a-news-item)
4. [Write a blog post](#write-a-blog-post)
5. [Write a post as a Jupyter notebook](#write-a-post-as-a-jupyter-notebook)
6. [Add a paper to Reading](#add-a-paper-to-reading)
7. [Update citation numbers](#update-citation-numbers)
8. [Software (packages and dashboards)](#software)
9. [Update the CV](#update-the-cv)
10. [Profile and site settings](#profile-and-site-settings)
11. [Research themes](#research-themes)
12. [Headshot and social card](#headshot-and-social-card)
13. [Comments and visitor counts](#comments-and-visitor-counts)
14. [Redirect an old address](#redirect-an-old-address)
15. [Hide or delete something](#hide-or-delete-something)
16. [If the build fails](#if-the-build-fails)
17. [First-time setup on your computer](#first-time-setup-on-your-computer)
18. [Where things are](#where-things-are)

---

## How editing works

There are two ways to edit.

**In the browser (nothing to install)**

1. Open the repository on GitHub.
2. To change one file: open it and click the pencil icon. To change several files: press `.`
   on the repository page. This opens github.dev, a full editor in the browser.
3. Make the change. In github.dev, open the Source Control panel (the branch icon on the left),
   type a message and click **Commit & Push**. On a single file, click **Commit changes**.

**On your computer**

Edit the files, check the result with `npm run dev`, then `git commit` and `git push`.
See [First-time setup on your computer](#first-time-setup-on-your-computer).

**Did it work?**

- On the repository page, the latest commit shows a yellow dot (building), a green tick (live)
  or a red cross (failed). Click it for details.
- The **Actions** tab lists every build. A red cross means the site was not changed; see
  [If the build fails](#if-the-build-fails).

---

## Add a paper

File: `src/data/publications.bib`

1. Get the BibTeX entry from Google Scholar (Cite, then BibTeX), Zotero, or the DOI:
   `curl -LH "Accept: application/x-bibtex" https://doi.org/10.1029/2026WR041234`
2. Paste it into the file, anywhere (the site sorts by date). The top of the file is easiest.
3. Add the site fields (`pubtype`, `topic` and any optional ones below).
4. Commit.

A journal article with every field:

```bibtex
@article{nandi2026snow,
  author    = {Nandi, Saswata and Kandhway, Anshika and Safeeq, Mohammad},
  title     = {Snow drought and summer streamflow in the {Sierra Nevada}, {California}},
  journal   = {Water Resources Research},
  year      = {2026},
  month     = oct,
  volume    = {62},
  number    = {10},
  pages     = {e2026WR041234},
  doi       = {10.1029/2026WR041234},
  pubtype   = {journal},
  topic     = {climate-extremes, fire-and-water},
  selected  = {true},
  pdf       = {/papers/nandi2026snow.pdf},
  code      = {https://github.com/iamsaswata/snow-drought},
  data      = {https://doi.org/10.5281/zenodo.1234567},
  slides    = {https://example.org/agu2026-slides.pdf},
  summary   = {Years with little snow give rivers less water in late summer, even when total precipitation is normal.},
  image     = {/images/papers/nandi2026snow.png},
  image_alt = {Map of snow drought frequency across the Sierra Nevada, highest in the southern basins.},
  abstract  = {First paragraph of the abstract.

Second paragraph. Write 50\% and R\&D with a backslash.}
}
```

What each site field does:

| Field | What it does |
| --- | --- |
| key (`nandi2026snow`) | The paper's address: `/publications/nandi2026snow/`. Letters, digits, `-` and `_` only. Do not change it once the paper is online. |
| `pubtype` | The tab on /publications/: `journal`, `chapter` (Book chapters), `proceedings` (Conference papers), `abstract` or `talk` (both under Talks & abstracts). If missing, it is guessed from `@article`, `@incollection`, `@inproceedings`, `@misc`. |
| `topic` | Research themes, separated by commas: `fire-and-water`, `modelling-water-cycle`, `climate-extremes` (the file names in `src/content/research/`). The paper is listed on each theme's page and can be filtered by theme on /publications/. |
| `selected = {true}` | Shows the paper under "Selected papers" on the home page. The home page shows the **four newest** selected papers. Older selected papers stay in the list on /publications/. |
| `pdf`, `code`, `data`, `slides` | Buttons (PDF, Code, Data, Slides) in the list and on the paper's page. Use a full `https://` link. For `pdf` and `slides` you can also put the file in `public/` and write its path: `public/papers/nandi2026snow.pdf` is written `/papers/nandi2026snow.pdf`. |
| `summary` | One or two plain sentences, shown in an "In brief" box on the paper's page and used as its description in search results. |
| `abstract` | Shown on the paper's page. A blank line starts a new paragraph. Write `\%` and `\&`. |
| `image`, `image_alt` | A figure on the paper's page. Put the file in `public/images/papers/` and write `/images/papers/<file>`. `image_alt` describes the picture and is shown as its caption. |

The DOI gives a DOI button. Your name is bolded automatically. "Copy BibTeX" on the paper's page
gives visitors the entry without the site fields.

Afterwards the paper appears on /publications/, on its own page, on the theme pages in `topic`,
on the home page if selected, and in the CV PDF.

**Shorter examples**

A book chapter:

```bibtex
@incollection{nandi2026chapter,
  author    = {Nandi, Saswata and Reddy, M. Janga},
  title     = {Macroscale hydrological modelling of Indian river basins},
  booktitle = {Water Resources Management in a Changing Climate},
  editor    = {Singh, V. P.},
  publisher = {Springer},
  series    = {Water Science and Technology Library},
  year      = {2026},
  pages     = {45--67},
  doi       = {10.1007/978-3-031-00000-0_3},
  pubtype   = {chapter},
  topic     = {modelling-water-cycle}
}
```

A conference paper:

```bibtex
@inproceedings{nandi2026igarss,
  author    = {Nandi, Saswata and Safeeq, Mohammad},
  title     = {Satellite vegetation in a 1 km land-surface model},
  booktitle = {Proceedings of IGARSS 2026},
  publisher = {IEEE},
  year      = {2026},
  pages     = {1201--1204},
  doi       = {10.1109/IGARSS.2026.0000000},
  pubtype   = {proceedings},
  topic     = {modelling-water-cycle}
}
```

A conference abstract (for a talk, write `pubtype = {talk}`):

```bibtex
@misc{nandi2026agu,
  author       = {Nandi, S. and Safeeq, M.},
  title        = {Atmospheric rivers on burned hillslopes},
  howpublished = {AGU Fall Meeting 2026},
  address      = {San Francisco, CA, USA},
  year         = {2026},
  month        = dec,
  note         = {Abstract H12A-01},
  pubtype      = {abstract},
  topic        = {climate-extremes},
  slides       = {/slides/agu2026.pdf}
}
```

Tips: wrap acronyms and place names in braces in titles (`{VIC}`, `{India}`) so they keep their
capitals. The same examples are in `templates/new-paper.bib`.

**Remove a paper:** delete the entry. To hide it but keep the text, delete the `@` in front of
`@article` (BibTeX then treats the entry as a comment). If other files use the key, update them
too: search the repository for the key (for example `nandi2026snow`).

---

## Add a news item

File: `src/data/news.yaml`

Add a block anywhere in the list (the order in the file does not matter):

```yaml
- date: 2026-10-15
  text: New paper in **Water Resources Research** on snow drought in the Sierra Nevada.
  link: https://doi.org/10.1029/2026WR041234
```

Without a link:

```yaml
- date: 2026-12-16
  text: Talk at *AGU Fall Meeting 2026* on atmospheric rivers and burn scars. Slides on [the paper page](/publications/nandi2026agu/).
```

- `text` is Markdown: `**bold**`, `*italic*`, `[a link](https://...)`. Keep it to one or two lines.
- `link` adds a "Read" link after the text. It can be a full `https://` address or a page on
  this site such as `/blog/snow-drought/`.
- Add `draft: true` to hide an item.

The home page shows the **five newest** items. There is no separate news page, so older items are
simply not shown.

---

## Write a blog post

1. Copy the folder `src/content/blog/example-post/` to `src/content/blog/snow-drought/`.
   The folder name becomes the address: `/blog/snow-drought/`. Use lowercase and hyphens.
2. In `snow-drought/index.md`, replace the block between the `---` lines (the front matter).
3. Write the post in Markdown below it.
4. Set `draft: false` and commit.

Front matter with every field (delete the optional lines you do not need):

```yaml
---
title: Snow drought in the Sierra Nevada
description: What a year with little snow means for late-summer streamflow, with maps and Python code.
date: 2026-10-20
tags: [snow, drought, python]
draft: false
# Optional:
updated: 2026-11-02              # shows "Updated 2 Nov 2026" under the title
series: Snow drought             # posts with the same series name link to each other
cover: ./cover.jpg               # a picture in this folder, shown under the title and on social cards
cover_alt: Snow-covered peaks above a half-empty reservoir in early summer.
toc: true                        # false hides the contents list
comments: true                   # false hides the comment box on this post
topics: [climate-extremes]       # research theme slugs (checked, not shown yet)
---
```

- `description` is up to 300 characters. It appears on the blog list, in search results and in RSS.
- `cover` needs `cover_alt`. The file must exist, or the build stops.
- **Tags:** lowercase words joined by hyphens, for example `remote-sensing`, `imdlib`. Each tag
  gets a page `/tags/<tag>/` listing the posts and reading entries with that tag.
- **Series:** give two or more posts the same `series:` text, for example `series: Snow drought`.
  Each post in the series shows a box linking to the others, oldest first.

**What you can write in the post**

Put pictures in the post folder (next to `index.md`). Then:

````markdown
## Pictures

![Map of April 1 snow water equivalent](./swe-map.png "April 1 snow water equivalent, 2021.")

## Maths

The runoff ratio is $C = Q / P$. Water balance:

$$
\frac{dS}{dt} = P - ET - Q
$$

## Code

```python
import imdlib as imd
data = imd.get_data('rain', 2020, 2021)
```

## Note boxes

> [!NOTE]
> Also `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` and `[!CAUTION]`.

## Tables

| Basin | Area (km²) | Mean flow (m³/s) |
| --- | ---: | ---: |
| Kings | 3,999 | 45 |
| Merced | 2,745 | 28 |

## Links

See [the IMDLIB paper](/publications/nandi2024imdlib/) and [the IMDLIB page](/software/imdlib/).
````

- The text in quotes after a picture is its caption (optional). The text in `[...]` describes the
  picture for screen readers.
- Code blocks get colours and a Copy button when you name the language (`python`, `bash`, `r`, ...).
- A contents list appears automatically when the post has three or more `##`/`###` headings.
- Link to a paper with `/publications/<key>/`, where `<key>` is the BibTeX key.

The post appears on /blog/, on its tag pages, in `/rss.xml`, and as "Latest post" on the home page.

---

## Write a post as a Jupyter notebook

1. Create the folder `src/content/blog/rainfall-notebook/`.
2. Put your notebook in it, named `index.ipynb`.
3. Make the **first cell a Markdown cell** containing only the front matter:

   ```yaml
   ---
   title: Wet days from IMD rainfall
   description: Counting wet days in IMD gridded rainfall with IMDLIB and xarray.
   date: 2026-10-25
   tags: [imdlib, python, rainfall]
   draft: false
   ---
   ```

   All the fields of a Markdown post work here too.
4. Run the notebook and save it **with its outputs**. The site shows the saved outputs and runs
   nothing.
5. Commit `index.ipynb` (and any picture files you added). Do not commit `index.ipynb.md` or
   `nb-output/`: they are made from the notebook at every build.

Pictures:

- Plots in the outputs are extracted automatically.
- A picture pasted into a Markdown cell (Jupyter stores it inside the notebook) works too.
- Or put `map.png` in the post folder and write `![Study area](./map.png "Caption")` in a Markdown cell.

Hide parts of the notebook with **cell tags**. In JupyterLab, select the cell, open the right
sidebar (gear icon, Property Inspector) and add the tag under Cell Tags:

| Tag | Effect |
| --- | --- |
| `remove-cell` | The whole cell is left out. |
| `remove-input` | Only the output is shown (hides the code). |
| `remove-output` | Only the code is shown. |

Warnings and progress bars (stderr) are left out automatically. `src/content/blog/example-notebook/`
is a working example (a draft).

---

## Add a paper to Reading

File: `src/data/reading.yaml`

Add a block to the top of the list:

```yaml
- title: Snow drought and its hydrological impacts in the western United States
  authors: Harpold, A., Dettinger, M. and Rajagopal, S.
  venue: Water Resources Research
  year: 2017
  doi: 10.1002/2017WR020803
  read: 2026-10
  tags: [snow, drought]
  why: Clear definitions of warm and dry snow drought, with a useful map of where each occurs.
  note: harpold-2017
```

- `authors` is typed as you want it shown.
- `year` is a number (no quotes). `read` is the month you read it, `YYYY-MM`.
- `doi` without `https://doi.org/`. If there is no DOI, use `url: https://...` instead.
- `venue`, `doi`/`url` and `note` are optional. `topics: [climate-extremes]` is optional too.
- Add `draft: true` to hide the entry. If it has a note, add `draft: true` to the note too, or the
  build stops.

For a longer note, keep `note: harpold-2017` and create `src/content/reading/notes/harpold-2017.md`:

```markdown
---
title: Notes on warm and dry snow drought
date: 2026-10-12
tags: [snow-drought]
---

The paper separates **warm** snow drought (normal precipitation, too warm to fall as snow)
from **dry** snow drought (too little precipitation).

## What I will use

- The definitions, for the Sierra Nevada basins.
```

All front matter fields are optional (`title` defaults to the paper title). Without `note:`,
delete that line from the entry and skip the file.

Afterwards the entry appears on /reading/ under "October 2026" with a "Read note" link, the note at
`/reading/harpold-2017/`, the tags on `/tags/snow/` and `/tags/drought/`, and the newest entry on
the home page. When the entries use two or more different tags, /reading/ shows a
"Filter by tag" row.

A `note:` without a matching file, or a note file that no entry links to, stops the build with a
message. A template is in `templates/reading-entry.yaml`.

---

## Update citation numbers

File: `site.config.yaml`, block `metrics`

```yaml
metrics:
  citations: 620
  h_index: 12
  i10: 13
  source: Google Scholar
  updated: 2026-10-01
```

Copy the numbers from your Google Scholar profile. They appear at the top of /publications/ only.
`source` and `updated` are for your own record and are not shown. Use `null` to hide a number.
Numbers have no quotes.

---

## Software

File: `src/data/software.yaml`

### Update downloads and stars

Change the `stats` block of the package:

```yaml
  stats:
    stars: 120
    downloads: 290000
    downloads_label: PyPI downloads
    as_of: 2026-10-01
```

Stars from the GitHub repository page, downloads from https://pepy.tech/projects/imdlib, `as_of`
the day you copied them. `null` hides a number. Also update `version:` after a release.

/software/ has two sections: **Packages** (code you install) and **Dashboards** (web apps people
open in the browser). `kind: dashboard` puts an entry in Dashboards; without `kind`, it is a package.
A section with no entries is not shown. Cards appear in the order of the file, so to move a card,
move its block.

### Add a package

Add a block to the list, after the other packages:

```yaml
- name: snowdrought
  slug: snowdrought
  tagline: Snow-drought indices from daily snow water equivalent.
  description: Python package to compute warm and dry snow-drought indices from SNOTEL and gridded SWE data.
  repo: https://github.com/iamsaswata/snowdrought
  docs: https://snowdrought.readthedocs.io
  pypi: snowdrought
  language: Python
  license: MIT
  version: 0.1.0
  status: Beta
  install:
    - pip install snowdrought
  stats:
    stars: 12
    downloads: 850
    downloads_label: PyPI downloads
    as_of: 2026-10-01
```

Only `name` and `description` are required. Other fields you can add:

- `website: https://...` (a project site).
- `citation:` with `text`, `doi`, `bib` (a key in publications.bib) and `software_doi` (see IMDLIB).
- `links:` extra links on the detail page, for example `- { label: Tutorial, url: https://... }`.
- `snippet:` a short code example, shown on the featured card only.
- `page: true` gives the package its own page `/software/snowdrought/`. Then also create
  `src/content/software/snowdrought.md` (copy `imdlib.md` and rewrite the text), or the build stops.

The card appears under Packages on /software/. It shows the badges (`language`, `license`,
`version`, `status`), the first `install` line with a Copy button, and buttons for the links.

`featured: true` gives a large card with a code panel (first install line and the snippet), first
under Packages. The home page shows the first featured package (now IMDLIB). Keep only one package
featured.

### Add a dashboard

Add a block to the list, after the other dashboards:

```yaml
- name: SNOWCAST
  subtitle: Snow Outlook for California Streams
  description: Weekly snowpack and streamflow outlook for the Sierra Nevada, with maps of snow water equivalent and forecast flows for the main reservoirs.
  website: https://snowcast.example.org/
  kind: dashboard
```

- `kind: dashboard` puts it under Dashboards.
- `website` is the dashboard's address. It is required: the card's one button, "Open SNOWCAST ↗", goes there.
- `subtitle` (optional) is one line under the name, for example what the name stands for.
- `description` is a sentence or two on what the dashboard shows.
- Badges, install lines and stats are not shown on dashboard cards, so leave those fields out.

FLARE and ARWIN in `software.yaml` are working examples.

### Edit the IMDLIB page

File: `src/content/software/imdlib.md`

- The text below the `---` block is the page `/software/imdlib/`. Edit it like a blog post.
- `updated: 2026-10-01` is shown at the bottom: "Page last checked against the current release
  in Oct 2026".
- `description` is the text for search engines.
- Name, buttons, version, badges, stats and "How to cite" come from the IMDLIB block in
  `software.yaml`, not from this file.
- Pictures go in `src/content/software/images/`, written `![Mean rainfall](./images/imdlib-mean-rainfall.png)`.

---

## Update the CV

File: `src/data/cv.yaml`. The CV is only the PDF at `/cv.pdf`. It is rebuilt on every deploy.
Publications come from `publications.bib`, so do not list them here.

Rules for all sections:

- Dates are a year (`2021`) or a year and month (`2021-08`).
- `end: present` shows "present" and means the item is ongoing.
- `details` is one line, or a list of lines (shown as bullets).
- `draft: true` hides an item (not available for reviewer journals, skills, interests and languages).
- Items are shown in the order you write them (mentoring is sorted newest first). Write newest first.

Paste each example at the top of its section.

**Position** (under `positions:`). When you start a new job, also change the old job's
`end: present` to its last year or month.

```yaml
  - title: Assistant Professor
    org: Department of Civil Engineering, Example University
    org_url: https://example.edu
    location: Boulder, CO, USA
    start: 2027-01
    end: present
    details:
      - Leads the Mountain Hydrology Lab.
      - Teaches undergraduate hydrology.
```

**Education** (under `education:`). Use `year` for the award year, or `start` and `end`.

```yaml
  - degree: Postgraduate Certificate
    field: Machine Learning for Earth Sciences
    institution: Example University
    year: 2026
    details: Capstone on deep-learning streamflow forecasts
```

**Grant** (under `grants:`)

```yaml
  - title: Seasonal outlooks of post-fire debris-flow risk in California
    role: PI
    funder: National Science Foundation
    amount: USD 350,000
    start: 2027
    end: 2030
    url: https://www.nsf.gov/awardsearch/
```

**Award or honour** (under `awards:`)

```yaml
  - title: Early Career Hydrologic Sciences Award
    org: American Geophysical Union
    year: 2026
```

**Teaching** (under `teaching:`). `term` is free text.

```yaml
  - course: CEE 150 Hydrology
    role: Guest lecturer
    institution: UC Merced
    term: Spring 2026
    details: Two lectures on snow hydrology.
```

**Mentoring** (under `mentoring:`). `dates` is shown instead of `start`/`end` when given.

```yaml
  - name: Priya Sharma
    level: MS student
    institution: UC Merced
    start: 2026
    end: present
    topic: post-fire sediment yield in the Kings River basin
```

**A journal to the reviewer list** (under `service:`, then `reviewer:`), one name per line:

```yaml
    - Water Resources Research
```

**A skill:** add it inside the brackets of a group, or add a new group under `skills:`:

```yaml
  - group: Cloud Computing
    items: [AWS, Google Cloud, Pangeo]
```

**References** are hidden. To show them in the PDF, set `show_references: true`.

**Paper size:** `pdf.paper` is `us-letter` or `a4`:

```yaml
pdf:
  paper: a4
```

**Check the PDF on your computer** (needs Typst, see
[First-time setup](#first-time-setup-on-your-computer)):

```sh
npm run cv:pdf
```

This writes `public/cv.pdf` (not committed). Open it, or run `npm run dev` and visit
http://localhost:4321/cv.pdf. `npm run cv:data` checks `cv.yaml` without making the PDF.

The `summary` at the top of `cv.yaml` has hand-typed numbers (papers, citations, downloads).
Update them when you update the metrics.

---

## Profile and site settings

File: `site.config.yaml`

**Title, affiliation, location, email**

```yaml
role: Assistant Professor · Hydrology
affiliation:
  name: "Example University"
  url: "https://example.edu/hydrology"
location: Boulder, Colorado, USA
email: saswata@example.edu
```

These appear on the home page, in the CV PDF header and in the footer. The email is written into
the page in a hidden form, so spam robots cannot read it. Leave a field as `""` to hide it.

**Bio** (Markdown, on the home page). Keep the `|` and indent every line by two spaces:

```yaml
bio: |
  I am a hydrologist working on **snow, fire and water** in mountain watersheds.
  I created [IMDLIB](/software/imdlib/), an open-source Python library for Indian gridded weather data.
```

`description` (one line, up to 200 characters) is the text search engines and social cards show.

**Profile links.** Each can be a full address or the short form shown here. Empty `""` hides it.

```yaml
links:
  scholar: "https://scholar.google.com/citations?user=hXkanPEAAAAJ"   # full address only
  orcid: "0000-0003-3833-966X"                                         # the iD, or https://orcid.org/...
  github: "iamsaswata"                                                 # username, or https://github.com/...
  linkedin: "nandisaswata"                                             # the id after /in/, or the full address
  bluesky: "@saswata.bsky.social"                                      # handle, or https://bsky.app/profile/...
  x: "@saswatanandi"                                                   # handle, or https://x.com/...
  researchgate: "https://www.researchgate.net/profile/Saswata-Nandi"   # full address only
```

Scholar, ORCID and GitHub also appear as buttons on the home page. All links appear in the footer.

**Menu.** The order in the list is the order in the header. Change `label` to rename an item.
Delete a line to remove it. For example, to put Blog second:

```yaml
nav:
  - { label: Research, href: /research/ }
  - { label: Blog, href: /blog/ }
  - { label: Publications, href: /publications/ }
  - { label: Software, href: /software/ }
  - { label: Reading, href: /reading/ }
  - { label: CV, href: /cv.pdf }
```

**Citation metrics:** see [Update citation numbers](#update-citation-numbers).

**Paper badges.** Each paper page shows an Altmetric donut and a Dimensions citation count (papers
with a DOI). Empty badges hide themselves.

```yaml
publications:
  badges:
    altmetric: true    # false = off everywhere
    dimensions: true   # false = off everywhere
    in_list: false     # true = also show them in the /publications/ list
```

**Analytics and comments:** see [Comments and visitor counts](#comments-and-visitor-counts).

---

## Research themes

Files: `src/content/research/<theme>.md`, pictures in `src/assets/research/`

### Edit the text

- The text below the `---` block is the theme page (`/research/fire-and-water/`).
- `summary` (up to 320 characters) is the short text on the cards on the home page and on /research/.
- `title` is the heading. `order: 1` puts the theme first.
- A line `<!-- figure -->` in the text marks where the main picture (`image:`) goes. A picture
  without a marker goes after the text.

### Swap a picture for your own

1. Put the file in `src/assets/research/`, for example `src/assets/research/burn-scar-2021.jpg`.
   PNG, JPG or WEBP (resized automatically), or SVG.
2. In the theme file, change the picture lines:

   ```yaml
   image: burn-scar-2021.jpg
   image_alt: Satellite image of the 2021 Dixie Fire burn scar above Lake Almanor, with the burned area in dark red.
   image_caption: The Dixie Fire burn scar in October 2021.
   ```

   `image_alt` is required (at least a sentence) and is read aloud by screen readers.
   `image_caption` is shown under the picture (optional).
3. The cards use `thumbnail:` if the theme has one. To show your new picture on the cards too,
   delete the `thumbnail:` line, or set `thumbnail:` to another file in `src/assets/research/`.

### Add a second picture

In the front matter, add a `figures:` list. In the text, put `<!-- figure 2 -->` where it goes.

```yaml
figures:
  - image: burn-scar-2021.jpg
    alt: Satellite image of the 2021 Dixie Fire burn scar above Lake Almanor, with the burned area in dark red.
    caption: The Dixie Fire burn scar in October 2021.
```

- `alt` is required; `caption` is optional.
- A third picture is a second item in the list, placed with `<!-- figure 3 -->`.
- A marker with no matching picture stops the build with a message.
- `modelling-water-cycle.md` already uses `figures:`; look at it for a working example.

### Add a new theme

1. Create `src/content/research/snow-hydrology.md`. The file name is the theme's slug: it is the
   address `/research/snow-hydrology/` and the value you use in `topic = {...}`.
2. Put your picture in `src/assets/research/snow-hydrology.jpg`. A picture is required.
3. Write the file:

   ```markdown
   ---
   title: Snow and mountain water supply
   order: 4
   summary: I study how a shrinking snowpack changes the timing and amount of water that mountain rivers deliver.
   image: snow-hydrology.jpg
   image_alt: Snow survey site in the Sierra Nevada with a snow pillow and a meteorological tower.
   image_caption: A snow monitoring site in the American River basin.
   ---

   Snow stores winter precipitation and releases it in spring and summer.

   <!-- figure -->

   My work combines field observations with land-surface modelling.
   ```

4. Tag papers with it in `publications.bib`: `topic = {snow-hydrology}` or
   `topic = {snow-hydrology, climate-extremes}`.
5. Commit.

The theme appears on the home page, on /research/, as a filter on /publications/ (once a paper
uses it), and at `/research/snow-hydrology/` with its papers listed.

Renaming a theme file changes its slug: update every `topic` that used the old name, or the build
stops, and add a [redirect](#redirect-an-old-address) from the old address.

---

## Headshot and social card

**Headshot:** replace `public/images/headshot.jpg`. Keep the same file name.

- Square JPG, at least 600 × 600 pixels (it is shown about 270 pixels wide; the extra pixels keep
  it sharp on high-resolution screens). Under 200 KB is plenty.
- It is cropped to a circle, so keep your face in the centre with some space around it. A picture
  that is not square is cropped to its centre.

**Social card:** `public/og-default.png`, 1200 × 630 pixels. It is the picture shown when someone
shares a link to the site (posts with a `cover` use their cover instead). It shows your name and
role. You can replace the file with any 1200 × 630 PNG. To regenerate it after changing
`name` or `role` in `site.config.yaml`, run on your computer:

```sh
npm i -D playwright && npx playwright install chromium
node scripts/generate-images.mjs
```

This needs Playwright (a browser the script drives) and rewrites the favicon files too. Commit the
changed PNG files, but not the `package.json` and `package-lock.json` changes that the install made
(`git checkout package.json package-lock.json`).

---

## Comments and visitor counts

### Visitor counts (GoatCounter)

1. Create a free account at https://www.goatcounter.com/signup. The code you choose becomes your
   dashboard address, for example `snandi` gives `snandi.goatcounter.com`.
2. In `site.config.yaml`:

   ```yaml
   analytics:
     goatcounter: "snandi"
   ```
3. Commit. Visits appear on your GoatCounter dashboard. No cookies are used. `""` switches it off.

### Comments on blog posts (giscus)

Comments are stored as GitHub Discussions in the site's repository. Visitors sign in with GitHub.

1. On the repository: Settings, General, Features, tick **Discussions**.
2. Install the giscus app: https://github.com/apps/giscus, choose "Only select repositories"
   and pick this repository.
3. Open https://giscus.app. Under Repository, type `saswatanandi/saswatanandi.github.io`. Under
   Discussion Category, choose **Announcements**. Leave the page mapping as it is.
4. In the "Enable giscus" section, the code shows four values: `data-repo`, `data-repo-id`,
   `data-category` and `data-category-id`. Copy them into `site.config.yaml`:

   ```yaml
   giscus:
     repo: "saswatanandi/saswatanandi.github.io"
     repo_id: "R_kgDOabc123"
     category: "Announcements"
     category_id: "DIC_kwDOabc123c4Cabcd"
   ```
5. Commit. A comment box appears under every published post. `comments: false` in a post's front
   matter hides it there. It stays off until all four values are filled in.

---

## Redirect an old address

File: `src/lib/redirects.mjs`

Use this when an address that people may have saved changes (a renamed post, a moved page).
Add a line inside `export const redirects = { ... }`, for example after `'/posts': '/blog/',`:

```js
  '/imdlib': '/software/imdlib/',
```

The old address is on the left (starting with `/`), the new one on the right. After the build,
https://saswatanandi.github.io/imdlib opens the IMDLIB page. Also add the pair to the table in
`docs/redirects.md` so you have a record.

---

## Hide or delete something

**Hide with `draft: true`** (stays in the repository, disappears from the live site, still visible
in `npm run dev`):

| What | Where to put `draft: true` |
| --- | --- |
| Blog post | front matter of `index.md` (or the notebook's first cell) |
| News item | the item in `news.yaml` |
| Reading entry | the entry in `reading.yaml`. If it has a note, also in the note file (otherwise the build stops). |
| Reading note only | front matter of the note file. The entry stays and its "Read note" link disappears. |
| CV item | the item in `cv.yaml` (positions, education, grants, awards, talks, teaching, mentoring, service items, press, software, references) |

**No draft option:**

- **Paper:** delete the `@` in front of `@article` to hide it (see [Add a paper](#add-a-paper)).
- **Software package or dashboard:** delete its block from `software.yaml`. If it had `page: true`, also
  delete `src/content/software/<slug>.md`.
- **Research theme:** first remove its slug from every `topic` in `publications.bib` (and any
  `topics:` in posts and reading entries), then delete the file.

**Deleting safely**

- A blog post: delete its folder. If it was online for a while, add a
  [redirect](#redirect-an-old-address) from `/blog/<name>/` to `/blog/`.
- Anything else: delete the entry or file. If the build fails, the message names what still refers
  to it.
- Everything stays in the git history, so nothing is lost for good.

---

## If the build fails

1. On GitHub, open the **Actions** tab and click the run with the red cross.
2. Click the **build** job, then open the step with the red cross (usually **Build CV PDF** or
   **Build**). The error names the file, the entry and the field. For example, a paper with
   `pubtype = {article}`:

   ```
   ✖ publications.bib entry "nandi2026snow":
   ✖ Invalid option: expected one of "journal"|"chapter"|"proceedings"|"abstract"|"talk"
     → at pubtype
   ```
3. Fix the file and commit again. The live site stays unchanged until a build succeeds.

Common causes:

| Message mentions | Usual fix |
| --- | --- |
| `is not a research theme` | A `topic` is misspelt. Use a file name from `src/content/research/`. |
| `duplicate key` | Two BibTeX entries have the same key. Rename the new one. |
| `is not valid YAML` or a line and column | Indentation or a missing space after `:`. Text with `: ` inside needs quotes. |
| `Unrecognized key` | A field name is misspelt (for example `summery`). |
| `cover_alt` | A blog post has `cover` but no `cover_alt`. |
| `has no front matter` | A notebook's first cell is not the Markdown front matter cell. |

**Find the error on your computer** before pushing (see the setup below):

```sh
npm run build      # the whole site, same as GitHub
npm run check      # checks the site code and content types
npm run cv:data    # checks cv.yaml, site.config.yaml and publications.bib for the CV
```

---

## First-time setup on your computer

Do this once. You need git and a terminal.

1. Get the code:

   ```sh
   git clone https://github.com/saswatanandi/saswatanandi.github.io.git
   cd saswatanandi.github.io
   ```
2. Install Node 22 with nvm (https://github.com/nvm-sh/nvm). In the folder, `nvm` reads the
   version from `.nvmrc`:

   ```sh
   nvm install
   nvm use
   ```
3. Install the site's packages (once, and again after `package.json` changes):

   ```sh
   npm install
   ```
4. Preview while you edit:

   ```sh
   npm run dev
   ```

   Open http://localhost:4321. Pages reload when you save a file. Drafts are visible here.
   Search does not work in this mode. Stop with Ctrl+C.
5. Check the real build (same as GitHub, drafts hidden, search working):

   ```sh
   npm run build && npm run preview
   ```

   Open http://localhost:4321 again.
6. For the CV PDF, install Typst once and build the PDF:

   ```sh
   brew install typst
   npm run cv:pdf
   ```

   The PDF is `public/cv.pdf`.
7. Publish:

   ```sh
   git add -A
   git commit -m "Add snow drought paper"
   git push
   ```

Before each editing session, run `git pull` to get changes you made on GitHub.

---

## Where things are

| What | File |
| --- | --- |
| Papers, talks, abstracts | `src/data/publications.bib` (template: `templates/new-paper.bib`) |
| Paper PDFs and figures | `public/papers/`, `public/images/papers/` |
| News | `src/data/news.yaml` |
| Blog posts | `src/content/blog/<name>/index.md` or `index.ipynb`, pictures in the same folder |
| Reading list | `src/data/reading.yaml` (template: `templates/reading-entry.yaml`) |
| Reading notes | `src/content/reading/notes/<name>.md` |
| Research themes | `src/content/research/<theme>.md` |
| Research pictures | `src/assets/research/` |
| Software cards (packages and dashboards) | `src/data/software.yaml` |
| IMDLIB page text | `src/content/software/imdlib.md`, pictures in `src/content/software/images/` |
| CV | `src/data/cv.yaml` |
| Name, role, bio, links, menu, metrics, badges, analytics, comments | `site.config.yaml` |
| Headshot | `public/images/headshot.jpg` |
| Social card | `public/og-default.png` (script: `scripts/generate-images.mjs`) |
| Redirects | `src/lib/redirects.mjs` (record: `docs/redirects.md`) |
| Build and deploy | `.github/workflows/deploy.yml` |

Technical details (design, build, how each part works) are in `README.md`.
