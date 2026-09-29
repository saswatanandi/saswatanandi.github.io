# How to update the site

Every change is an edit to a text file in this repository. When you commit to `main`, GitHub
builds the site and publishes it in about two minutes. You can follow the build in the
**Actions** tab.

There are two ways to edit:

- **On GitHub:** open the file and click the pencil icon, or press `.` on the repository page
  to open a full editor in the browser. Commit when done. Nothing to install.
- **On your computer:** edit the files, check the result with `npm run dev`
  (http://localhost:4321), then `git commit` and `git push`.

If you make a mistake in a data file, the build stops and the log names the file and the field.
The live site stays as it was until the error is fixed.

---

## Add a paper

File: `src/data/publications.bib`

1. Get the BibTeX entry from Google Scholar (Cite → BibTeX), Zotero, or the DOI:
   `curl -LH "Accept: application/x-bibtex" https://doi.org/<doi>`
2. Paste it at the top of the file.
3. Add these fields inside the entry:
   - `pubtype = {journal}`, or `chapter`, `proceedings`, `abstract`, `talk`.
   - `topic = {fire-and-water}`: one or more of `fire-and-water`, `modelling-water-cycle`,
     `climate-extremes`, separated by commas.
   - Optional: `selected = {true}` (shows on the home page), `abstract = {...}`,
     `pdf`, `code`, `data`, `slides` (links, shown as buttons).
4. Commit.

The entry key (for example `nandi2024imdlib`) becomes the address of the paper's page,
`/publications/nandi2024imdlib/`. Do not change a key after the paper is online.
A full example is in `templates/new-paper.bib`.

The paper then appears on the Publications page, on its own page, on the research theme
pages it is tagged with, and in the CV PDF.

## Add a news item

File: `src/data/news.yaml`

```yaml
- date: 2026-10-15
  text: New paper in **Water Resources Research** on snow drought in the Sierra Nevada.
  link: https://doi.org/10.1029/...
```

The home page shows the five most recent items. Order in the file does not matter.

## Write a blog post

1. Copy the folder `src/content/blog/example-post/` to `src/content/blog/<short-name>/`.
   The folder name becomes the address: `/blog/<short-name>/`.
2. In `index.md`, edit the block at the top: `title`, `description`, `date`, `tags`.
3. Change `draft: true` to `draft: false`.
4. Write the post in Markdown below the block. Put pictures in the same folder and refer to them
   as `![What it shows](./figure.png "Caption")`.
5. Commit.

Maths: `$C = Q / P$` inline, `$$ ... $$` on its own lines. Code: fenced blocks with the language,
for example ```` ```python ````.

## Write a post as a Jupyter notebook

1. Copy `src/content/blog/example-notebook/` to `src/content/blog/<short-name>/`.
2. Replace `index.ipynb` with your notebook. Keep a first Markdown cell with the same
   block (`title`, `description`, `date`, `tags`, `draft: false`) between `---` lines.
3. Run the notebook and save it with its outputs. The site shows the saved outputs and does not
   run any code.
4. Commit only `index.ipynb` (and any pictures). The other files in the folder are generated.

## Add a paper to Reading

File: `src/data/reading.yaml`

```yaml
- title: Paper title
  authors: Surname, A. and Surname, B.
  venue: Water Resources Research
  year: 2025
  doi: 10.1029/2025WR000000
  read: 2026-10
  tags: [snow, remote-sensing]
  why: One line on why it is worth reading.
```

For a longer note, add `note: surname-2025` to the entry and create
`src/content/reading/notes/surname-2025.md` with your text. A template is in
`templates/reading-entry.yaml`.

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

Copy the numbers from your Google Scholar profile. Use `null` to hide a number.

## Update software downloads and stars

File: `src/data/software.yaml`, block `stats` under each package

Stars from the GitHub repository page, downloads from https://pepy.tech/projects/imdlib.
Set `as_of` to the day you copied them.

## Update the CV

File: `src/data/cv.yaml` (positions, education, grants, honours, teaching, mentoring, service,
skills). Publications come from `publications.bib`, so do not list them here.

The PDF at `/cv.pdf` is rebuilt on every deploy. To build it on your computer, install Typst once
(`brew install typst`) and run `npm run cv:pdf`.

## Change your title, affiliation, bio or links

File: `site.config.yaml` (name, role, affiliation, location, email, bio, profile links,
menu, analytics, comments).

## Change a research theme

Files: `src/content/research/<theme>.md`

- The text below the `---` block is the page.
- `summary` is the short text on the cards (home page and Research page).
- A picture goes where the text has the line `<!-- figure -->`. A second picture uses
  `<!-- figure 2 -->` and is listed under `figures:` in the top block.
- Picture files live in `src/assets/research/`. To use your own image, put the file there and
  set `image:` to its name.

## Hide something without deleting it

Add `draft: true` to a blog post, news item, reading entry or note. It stays in the repository and
disappears from the live site.

---

## If the build fails

1. Open the **Actions** tab on GitHub and click the failed run.
2. Open the **Build** step. The error names the file, the entry and the field, for example:

   ```
   ✖ publications.bib entry "nandi2026snow":
   ✖ Invalid option: expected one of "journal"|"chapter"|"proceedings"|"abstract"|"talk"
     → at pubtype
   ```
3. Fix the file and commit again.

## Where things are

| What | File |
| --- | --- |
| Papers | `src/data/publications.bib` |
| News | `src/data/news.yaml` |
| Reading list | `src/data/reading.yaml`, notes in `src/content/reading/notes/` |
| Blog posts | `src/content/blog/<name>/` |
| Research themes | `src/content/research/` |
| Software | `src/data/software.yaml`, IMDLIB page in `src/content/software/` |
| CV | `src/data/cv.yaml` |
| Name, bio, links, numbers | `site.config.yaml` |
| Headshot | `public/images/headshot.jpg` |

Technical details (design, build, redirects) are in `README.md`.
