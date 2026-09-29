# Migration notes: the three old blog posts

Source: `OldBlog/content/posts/` (Hugo, zzo theme). New homes: `src/content/blog/<folder>/index.md`.
The text is the owner's; only the edits listed here were made. Original dates are kept.

| Old file | New folder | Old URL (redirects) |
| --- | --- | --- |
| `cdo_install.md` | `cdo-install/` | `/en/posts/cdo_install/` |
| `imdlib_update_real.md` | `imdlib-update-real/` | `/en/posts/imdlib_update_real/` |
| `climate_indices_imdlib.md` | `climate-indices-imdlib/` | `/en/posts/climate_indices_imdlib/` |

## Changes common to all three

- Front matter mapped to the new fields: `title`, `description`, `date` (day kept, time and +05:30
  offset dropped), `tags`. Removed zzo-only fields: `hideToc`, `enableToc`, `enableTocContent`,
  `author`, `authorEmoji`, `categories` (categories were a subset of the tags). The contents list
  is now automatic.
- Tags lowercased; `softwares` became `software`; `IMD`/`IMDLIB` became `imd`/`imdlib`.
  `imdlib` was added to "Real time data processing using IMDLIB" so both IMDLIB posts share a tag.
- `featured_image` became `cover` (the file is copied next to the post) with a `cover_alt` text.
- Code fences written as ```` ``` bash ```` became ```` ```bash ````; the `terminal` fence became `text`.

## cdo-install

Layout:
- Removed `<div style="text-align: justify">` wrappers.
- Removed `<span style="color:blue">` around the table headers.
- The indented (4-space) code in "Bonus" and "Arguments" became fenced `text` blocks (same content).

Typos:
- "it's essential dependencies" → "its essential dependencies"
- "a experienced Linux user" → "an experienced Linux user"
- "can be be further tuned" → "can be further tuned"
- "When we suppy 4 arguments, their meaning are" → "When we supply 4 arguments, their meanings are"
- "arg3 aarg4" → "arg3 arg4"
- "3 rd argument" → "3rd argument" (twice)
- "An real example ... like this;" → "A real example ... like this:"
- "**_prefix_** ." → "**_prefix_**."

Commands (bug fix):
- `${w_d}` in the netcdf-fortran, proj and cdo `configure` lines → `${prefix}`. `w_d` was left over
  from the install script (where `w_d` is the install directory, the same as `prefix` here) and is
  undefined in the post.

Updated technical facts (checked 28 September 2026), with a dated note at the top of the post:
- libxml2 download: `ftp://xmlsoft.org/libxml2/libxml2-2.9.12.tar.gz` →
  `https://download.gnome.org/sources/libxml2/2.9/libxml2-2.9.12.tar.xz`. The libxml2 README
  (gitlab.gnome.org/GNOME/libxml2) names download.gnome.org as the source of official releases, and
  xmlsoft.org now points to the GNOME project. The FTP server could not be reached from here.
  GNOME has the `.tar.xz` file only (the `.tar.gz` name returns 404), so a line
  `tar -xJvf libxml2-2.9.12.tar.xz` was added to "Extract Packages".
- The note gives the current CDO release, 2.6.4 (code.mpimet.mpg.de/projects/cdo/files, dated
  2026-09-09). The table and commands still use the 2023 versions, which were not re-tested.
- Other download links were checked and still answer (zlib, HDF5, curl, udunits, expat, sqlite,
  PROJ, CDO 1.9.10, the gist). The two GitHub archive links could not be checked from here.

## imdlib-update-real

- Replaced the `<p>` wrappers with plain paragraphs; `0.25<sup>o</sup>` → `0.25°`.
- Typos: "now support" → "now supports"; "Downloading dail real-time" → "Downloading daily real-time"
  (a code comment); "The  output is" → "The output is".
- No content update needed: `pip install imdlib` and `conda install -c iamsaswata imdlib` still work
  (PyPI and the iamsaswata channel both have 0.1.22), and `get_real_data` / `open_real_data`
  still exist with the same arguments in 0.1.22.

## climate-indices-imdlib

- Removed the `<div style="text-align: justify">` wrapper.
- Removed the commented-out zzo `{{< img >}}` shortcode.
- Image path `/images/feature2/output_28_0.png` → `./output_28_0.png` (file copied next to the post);
  alt text "png" → "Maps of the 15 climate indices computed above, one panel per index".
- Typos: "meteorologist" → "meteorologists"; "This blog will showcases" → "This blog will showcase";
  "climate indicess" → "climate indices"; double spaces in two headings.
- Blank lines inside the long plotting code block were reduced to single blank lines.
- Updated technical facts (checked 28 September 2026 against the imdlib 0.1.22 source on PyPI), as a
  dated note at the top: the post says 0.1.17 is the latest version; the current release is 0.1.22,
  and `open_data`, `fill_na`, `clip`, `compute` (all 15 indices used) and `get_xarray` are unchanged.
- The old cover (`feature1/climate-indices.png`, a NOAA sea-level-pressure map unrelated to the post,
  255 px wide) was not carried over.

## For the owner to check

- **Figure vs text (climate-indices-imdlib):** the text and code clip to the Godavari basin, but the
  figure's axes (22.5–30.5° N, 69–79° E) look like Rajasthan, not the Godavari basin. Replace the
  figure or adjust the text.
- **CDO install script (gist):** it still downloads libxml2 from `ftp://xmlsoft.org`, so the one-line
  install in "Bonus" will probably fail at that step. Update the gist, then its URL in the post.
- conda: IMDLIB is now also on conda-forge (0.1.22). The post keeps `-c iamsaswata`; switch to
  `-c conda-forge` if you prefer.
