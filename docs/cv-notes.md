# CV notes for Saswata

`src/data/cv.yaml` was filled in from `CV_SaswataNandi.pdf` (6 pages, 2026). This file lists what
still needs your decision. Nothing below has been changed in `publications.bib` or `site.config.yaml`.

## 1. Publications: your CV compared with `publications.bib`

The website and the generated PDF take publications from `publications.bib` only.

### In your CV, missing from the .bib

| CV # | Entry | Suggestion |
| ---- | ----- | ---------- |
| 22 | Nandi, S., & Safeeq, M. (2026). Atmospheric rivers outperform teleconnections for California precipitation extremes. *Journal of Hydrologic Engineering*. **Under review** | Add when accepted, or add now with a status. The .bib has no "under review" type yet, so it would show up as a normal article. |
| 21 | Nandi, S., Chakraborty, A., & Safeeq, M. (2026). Dam-induced flow stabilization synchronizes ecosystem fluxes and amplifies drought vulnerability in regulated river systems. *Nature Sustainability*. **Under review** | Same as above. |

### In the .bib, not in your CV

- `kandhway2026crop`: Kandhway, Nandi, Conklin & Safeeq (2026), *Frontiers in Water* 8, 1879797, doi 10.3389/frwa.2026.1879797. This is probably newer than your CV; add it to your own CV too.
- `swain2017spi`: Swain, Patel & Nandi (2017), IGARSS 2017, 5505–5507, doi 10.1109/IGARSS.2017.8128250
- `swain2017regression`: Swain, Patel & Nandi (2017), I2CT 2017, 355–357, doi 10.1109/I2CT.2017.8226150

  Did you leave these two out on purpose? If so, delete them from the .bib.

### Different details (CV compared with .bib)

- **CV #18 / `jha2025climate`:** both list "Jha, P. K." twice as authors. Please check whether the second author is really someone else.
- **CV #18:** your CV's title leaves out the "Editorial:" prefix that the .bib has.
- **CV #12 / `nandi2023heatwave`:** CV has vol. 30 with no issue; .bib has 30(44).
- **CV #4 / `nandi2020spatiotemporal`:** CV has vol. 34 with no issue; .bib has 34(9).
- **CV #6 / `nandi2021vic`:**
  - Your CV gives the venue as *Algorithms for Intelligent Systems*, which is the Springer book series.
  - The .bib gives it as *Proceedings of International Conference on Scientific and Natural Computing* (type: proceedings).
  - Both have the same DOI. Choose one.
- **CV #8 / `nandi2021multiobjective`:** CV title reads "Multi-objective automatic calibration … multiobjective self adaptive"; .bib reads "Multiobjective … Self-Adaptive". Titles otherwise match.
- **CV #10 / `nandi2022imerg`:** "bias corrected" (CV) vs "bias-corrected" (.bib).
- **CV #3 / `nandi2018satellite`:** venue "IEEE International Geoscience and Remote Sensing Symposium" (CV) vs "IGARSS 2018 - 2018 IEEE International Geoscience and Remote Sensing Symposium" (.bib).
- **CV #1 / `nandi2017distributed`:** *European Water* 57, 71–76 has no DOI in either (fine if none exists).
- **Counting:**
  - Your CV says "22 papers": 20 published and 2 under review, with chapters and proceedings in one list.
  - The .bib holds 23 non-abstract items: 16 journal articles, 3 chapters and 4 proceedings, counting `kandhway2026crop` and the two 2017 IGARSS/I2CT papers.
  - The PDF CV lists them in separate groups (journal articles, book chapters, conference papers, abstracts), each numbered 1, 2, 3 … from the newest.

### Conference presentations

Your CV lists 12 conference presentations. The .bib has 6 of them as `pubtype = {abstract}`, and those
are shown under "Conference abstracts". These 6 are **not in the .bib yet**, so they are missing from the PDF CV and the publications page:

| Date | Title | Meeting |
| ---- | ----- | ------- |
| Dec 2025 | Estimation of saturated hydraulic conductivity from environmental covariates: A machine learning approach | AGU Fall Meeting 2025, New Orleans, LA, USA |
| Dec 2019 | A deep neural network approach for bias correction of satellite rainfall estimates | 24th International Conference on Hydraulics, Water Resources and Coastal Engineering (Hydro-2019), Hyderabad, India |
| Jan 2019 | Assessing suitability of TRMM precipitation data for flood forecasting of Upper Tungabhadra sub-basin in India | 4th World Congress on Disaster Management (WCDM), IIT Bombay, Mumbai, India |
| Nov 2018 | A parallel framework for improving efficiency of calibration for hydrological modelling | Conference on Next Frontiers in Civil Engineering: Sustainable and Resilient Infrastructures (NFiCE 2018), IIT Bombay, Mumbai, India |
| Dec 2017 | Application of a macroscale hydrologic model for water balance studies in the Sina River basin, Maharashtra | 22nd International Conference on Hydraulics, Water Resources and Coastal Engineering (Hydro-2017), Ahmedabad, Gujarat, India |
| Dec 2016 | Application of turning point test to rainfall time series over a river basin | 21st International Conference on Hydraulics, Water Resources and Coastal Engineering (Hydro-2016), Pune, India |

Your CV does not give the **authors** of these, so they could not be added. Here is a template to copy
(fill in `author`, and `note` if you have an abstract number):

```bibtex
@misc{nandi2025ksat,
  author       = {Nandi, S. and TODO},
  title        = {Estimation of saturated hydraulic conductivity from environmental covariates: A machine learning approach},
  howpublished = {AGU Fall Meeting 2025},
  address      = {New Orleans, LA, USA},
  month        = dec,
  year         = {2025},
  pubtype      = {abstract},
}
```

Small differences in the existing abstracts:
- The .bib says "Chicago, IL, USA" for AGU 2022; your CV says "Chicago, USA".
- The .bib's IUGG 2023 entry has DOI 10.57757/IUGG23-0380; your CV doesn't show it.

## 2. Content judgement calls in cv.yaml

- **Education.**
  - The line under each degree (e.g. "Process-based integrated modelling framework…") is shown as a bullet, exactly as in your CV. It is not labelled "Thesis", because your CV doesn't say it is the thesis title.
  - If it is the thesis title, move the text to `thesis:` and it will show as *Thesis: "…"*.
  - The PhD advisor (M. Janga Reddy) comes from your References section.
- **Positions.**
  - UC Merced: `start: 2022`, since your CV gives no month. Add one (e.g. `2022-09`) if you want.
  - SRF at IIEST Shibpur: Jan–Apr 2015.
- **Grants.** Your CV gives one year each (2024, 2022) and no end year.
- **Honours.** The MHRD/MoE National Doctoral Fellowship has no year in your CV; add `year:` if you like.
- **Skills.** Copied as written, including "HEC-Suits". Did you mean "HEC-Suite"? RAPID (used in your papers) is not in the skills list.
- **Summary.** The profile paragraph repeats hand-typed numbers: 22 papers, h-index 11, 567 citations, 251,000+ downloads. These will go stale, and they differ from `site.config.yaml` (`citations: 600`).
- **Research Impact.** This section of your CV was not copied. The citation metrics live in `site.config.yaml` (`metrics:`) and are shown on the site.
- **References.** Stored in cv.yaml but **hidden** (`show_references: false`). Their email addresses were deliberately left out because this repository is public. Set `show_references: true` if you want them in the PDF, and add `email:` only if each referee agrees.
- **Phone number.** Your CV shows +1 (209) 749-5962. It is not used anywhere on the site or in the generated PDF.

## 3. Suggestions for `site.config.yaml` (not changed)

| Field | Now | Your CV says |
| ----- | --- | ------------ |
| `role` | Postdoctoral Researcher · Hydrology | Postdoctoral Researcher (header) / Postdoctoral Research Scholar (Work Experience). Choose one to use everywhere. |
| `affiliation.name` | University of California, Merced | Sierra Nevada Research Institute (SNRI), UC Merced |
| `location` | California, USA | Merced, California 95340, USA (e.g. "Merced, California, USA") |
| `email` | withsaswata@gmail.com | snandi4@ucmerced.edu. Which should the site and PDF show? |
| `metrics.citations` | 600 | 567 (Google Scholar, 2026); set `metrics.updated` to the date |
| `links.github` | https://github.com/iamsaswata | same ✓ |
| `links.orcid`, `links.scholar` | — | same ✓ |

Your CV also names "Dr" before your name. The site uses plain "Saswata Nandi".

## 4. Remaining TODOs in cv.yaml

- Sections with nothing in them yet (hidden until filled): invited talks, languages, conference sessions, outreach.
- Optional extra detail: month for the UC Merced start, year for the MHRD fellowship, `since:` year for AGU membership.
