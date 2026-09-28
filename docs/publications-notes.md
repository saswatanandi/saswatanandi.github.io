# Publications: conversion notes for Saswata

`src/data/publications.bib` was built from `publication.txt` (29 entries), checked against
Crossref (and DataCite for the IUGG abstract) on 2026-09-28. Please skim this list and correct
anything in the `.bib` file directly.

## Counts

| Tab | `pubtype` | Entries |
| --- | --- | --- |
| Journal articles | `journal` | 16 |
| Book chapters | `chapter` | 3 |
| Conference papers | `proceedings` | 4 |
| Talks & abstracts | `abstract` | 6 |
| **Total** | | **29** |

## DOIs

All 23 DOIs resolve at doi.org. Metadata comes from Crossref for 22 of them. The IUGG DOI
(`10.57757/IUGG23-0380`) is registered with DataCite, so its metadata comes from there.

- **Fixed:** the IGARSS 2017 DOI in `publication.txt` has a doubled prefix
  (`10.1109/10.1109/IGARSS.2017.8128250`), which doesn't resolve. It is now `10.1109/IGARSS.2017.8128250`.
- No DOI: 5 AGU abstracts (none needed) and European Water 2017. For European Water, the PDF link
  `https://www.ewra.net/ew/pdf/EW_2017_57_10.pdf` works and is set as `url` and `pdf`.

## Where Crossref differs from publication.txt (Crossref version used)

All volume, issue and page numbers matched. Differences:

1. **Titles use the publisher's capitalisation.** Seven titles are in Title Case in Crossref:
   Casirati 2025 (Ecohydrology), Sina Basin 2020 (WRM), IGARSS 2018, the three Springer chapters
   and SNC 2021. On the site they appear as published. The BibTeX protects acronyms and place
   names (`{VIC}`, `{India}`), so LaTeX sentence-case styles still come out right.
2. **Jha et al. 2025:** the Crossref title starts with **"Editorial: "**. That prefix is kept.
   Crossref lists "Jha, Prakash Kumar" twice (two co-editors with the same name), as in your text.
3. **Nandi & Manne 2020 (WRM, Sina Basin):** Crossref lists the co-author as
   **"Manne, Janga Reddy"** (family name Manne). The same person is "Janga Reddy, Manne",
   "Reddy, Manne Janga" or "Reddy, M. J." on other papers. Every entry keeps its publisher's
   spelling. If you prefer one form, edit the `author` fields.
4. **Full names:** Crossref gives full given names ("Nandi, Saswata"). Your text uses initials.
   The lists show initials ("Nandi, S."). Paper pages and Google Scholar tags use the full names.
5. **Years and online-first dates.** For journal articles the year is the volume year, as in your list:
   - Swain et al., GloFAS/Narmada (ESPR 31(41)): online April **2023**, volume **2024**. Kept 2024.
   - Nandi & Swain, heatwaves (ESPR 30(44)): online August **2022**, volume **2023**. Kept 2023.
   - Nandi & Janga Reddy 2020 chapter (Water Management and Water Governance): online Nov **2020**,
     print **2021**. Kept 2020.
6. **Book titles:** Crossref has no subtitles, so the site shows "Climate Change Impacts on Water Resources"
   (you wrote "…: Hydraulics, Water Resources and Coastal Engineering") and "Water Management and
   Water Governance" (you wrote "…: Hydrological Modeling"). The Springer series ("Water Science and
   Technology Library", "Advances in Intelligent Systems and Computing", "Algorithms for Intelligent
   Systems") is in a `series` field.
7. **H2Open Journal:** you wrote "h2oj". The journal name is "H2Open Journal".
8. **SNC 2021** (`nandi2021vic`): Crossref files it as a book chapter in the *Algorithms for
   Intelligent Systems* series. It stays under Conference papers (`@inproceedings`), as you listed it.
9. **ARIMA 2018** (`swain2018arima`): the book is an AISC conference volume. It stays under
   Book chapters, as you listed it.
10. **Months** from Crossref were added (`month = …`). They only order papers within a year.

## Please check

- **AGU abstracts:** authors are as initials from your text, since there is no DOI to look up full names.
  Meeting locations were added from memory: 2022 Chicago, 2024 Washington DC, 2025 New Orleans.
  Delete the `address` lines if you'd rather not show them.
- **IUGG 2023:** stored as an oral presentation (`note = {Oral presentation, IUGG23-0380}`). Correct
  it if it was a poster.
- **Older 2017 items on the old site:** the old Hugo site had `igarss_2017`, `i2ct_2017` and `ewra_2017`
  under `content/publication/`. That folder wasn't in the files I received, so I couldn't compare.
  All three appear in `publication.txt` and are included. Tell me if the old site had anything else
  (talks, posters, a thesis).
- **Topic tags** follow `docs/topic-mapping.md`. Change any `topic = {…}` freely.

## Abstracts

7 entries have abstracts: 6 from Crossref, plus IUGG 2023 from DataCite.

`kandhway2026crop`, `datta2025climate`, `casirati2025forest`, `nandi2024projected`,
`swain2024meteorological`, `nandi2023tigge`, `nandi2020comparative`.

**22 have no abstract.** Elsevier, Springer, Taylor & Francis and IEEE don't share them through
Crossref. To add one, paste it as `abstract = {…}` (blank line between paragraphs; write `\%` and `\&`):

- Journal: `jha2025climate` (editorial; may not have one), `nandi2024groundwater`, `swain2024hydrological`,
  `nandi2024imdlib`, `nandi2023multimodel`, `nandi2023heatwave`, `nandi2022imerg`, `nandi2022integrated`,
  `nandi2020spatiotemporal`, `nandi2017distributed`
- Chapters: `nandi2021multiobjective`, `nandi2020macroscale`, `swain2018arima`
- Conference papers: `nandi2021vic`, `nandi2018satellite`, `swain2017spi`, `swain2017regression`
- AGU abstracts: `chakraborty2025drought`, `nandi2024wildfires`, `khan2024forest`, `nandi2022flood`,
  `datta2022severity` (the text is on each AGU abstract page)

The four selected papers could also use a one-sentence `summary` (plain language) and maybe an
`image`. Both are shown on the paper's page.
