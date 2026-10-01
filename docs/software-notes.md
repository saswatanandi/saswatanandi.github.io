# Software pages: notes (September 2026)

What was checked, and what changed from the old Hugo page `content/softwares/imdlib.md`.
Checked on 28 September 2026.

## Facts checked against primary sources

| Fact | Value | Source |
| --- | --- | --- |
| IMDLIB latest version | 0.1.22, released 21 Sep 2026 | PyPI JSON, `imdlib/version.py`, docs changelog |
| Python needed | 3.10 or newer (pandas 2.2 or newer) | PyPI `requires_python`, changelog |
| License | MIT | PyPI, `LICENSE` |
| conda | on conda-forge (0.1.22) and on the `iamsaswata` channel (latest 0.1.22) | api.anaconda.org |
| Docs | https://imdlib.readthedocs.io (200) | |
| Repository | github.com/iamsaswata/imdlib exists (cloned; last commit 22 Sep 2026) | git |
| API | `get_data(var_type, start_yr, end_yr=None, fn_format=None, file_dir=None, sub_dir=False, proxies=None)`, `open_data(var_type, start_yr, end_yr=None, fn_format=None, file_dir=None)`, `IMD.get_xarray()`, `to_csv(file_name, lat, lon, out_dir)`, `to_netcdf(file_name, out_dir)`, `to_geotiff(file_name, out_dir)`, `get_real_data`, `open_real_data`, `compute`, `climatology`, `anomaly`, `heatwave`, `coldwave`, `spatial_mean`, `clip`, `fill_na`, `remap`, `copy` | `imdlib/core.py`, `imdlib/real.py` |
| Grids | archive rainfall 0.25°, archive temperature 1°; real-time rainfall 0.25°, temperature 0.5° | `open_data`, `open_real_data` |
| Paper | Nandi, Patel and Swain (2024), EMS 171, 105869, doi 10.1016/j.envsoft.2023.105869 (resolves) | publications.bib, docs |
| Software DOI | 10.5281/zenodo.7205414 (resolves; the repo README recommends it) | Zenodo |
| Video tutorial | youtube.com/watch?v=uSIPPY5WRaM, "IMDLIB - A python package to download and handle data from IMD", Albedo Foundation | YouTube oEmbed |
| prismdata | PyPI 0.0.1 (May 2024), MIT, Python 3.8+; repo github.com/iamsaswata/prismdata exists; docs prismdata.readthedocs.io (200) | PyPI, git |
| ARWIN | arwin.edwateragency.org: see "Needs the owner" | |

## Stats (entered by hand in software.yaml)

- IMDLIB downloads: 284,147 total PyPI downloads (pepy.tech, 28 Sep 2026). pypistats gave 38,603 in the last 180 days
  without mirrors. conda downloads (shields.io): about 3.5k on `iamsaswata`, 86 on conda-forge; not shown.
  The CV says "251,000+ downloads"; update it if you want the numbers to match.
- GitHub stars: not readable from the build machine (GitHub API blocked), left `null`. Add the number from the repo page.

## Changes to the IMDLIB page text

Kept the owner's text and order; removed the zzo front matter, the `<div style=...>`, `<span style=...>` and
`<mark>` HTML; fixed spelling (Meterological, grided, downliading, objetct, coordinare, functionaality, deafult, ...).

1. Installation: conda-forge added as the first option (`iamsaswata` channel mentioned as still working).
   **Updated September 2026** note added.
2. Removed the pinned dependency table (certifi 2019.11.28, pandas 0.25.3, xarray 0.14.1, ...) and "python >= 3.5".
   Replaced by Python 3.10+, pandas 2.2+, and the current dependency list from PyPI.
3. Download example: comment "8 years" for 2010 to 2018 corrected to 9 years. The long docstring inside the code
   block became a list of options. Added that `get_data` returns the IMD object and skips files already downloaded
   (0.1.22 changelog).
4. `data.shape` output: "(365, 135 129)" corrected to "(365, 135, 129)", with the dimension order stated.
5. `type(ds)`: the old page said `xarray.core.dataarray.DataArray`; `get_xarray()` returns a Dataset
   (the old code already used `ds['rain']`). Corrected.
6. Plot example: removed `ds = ds.where(ds['rain'] != -999.)`; `get_xarray()` now masks −999 itself.
   **Updated September 2026** note added.
7. Saving example: `file_name` was undefined; now `'rain.csv'`, `'rain.nc'`, `'rain.tif'`, and the CSV file name
   written by `to_csv` is shown.
8. New section "More functions" (real-time data, climate indices, SPI/SPEI, heat and cold waves, climatology and
   anomaly, clip, spatial mean, fill_na, remap) with a short verified example; marked **Updated September 2026**.
9. NetCDF paragraph: the Unidata "XArray & CF" tutorial link is dead (404); replaced by the cf_xarray docs.
   Link to the IMD site changed from http://www.imdpune.gov.in/ to https://imdpune.gov.in/.
10. "How to cite", "License" and "Links" are built from `software.yaml` (single source for the home card,
    /software/ and /software/imdlib/).

## Screenshot

`src/content/software/images/imdlib-mean-rainfall.png` is the old `static/softwares/imdlib1.png`: a map of India
coloured by mean daily rainfall (viridis, 0 to about 18 mm/day, highest on the west coast and in the north-east),
axes "lon"/"lat", colour bar "rain". The map is still what the example produces. Current versions set
`long_name` and `units`, so the labels would now read "latitude [degrees_north]" and "Rainfall [mm/day]";
the caption note says so. Replace it with a fresh plot when convenient.

## Needs the owner

- GitHub stars for IMDLIB (and prismdata if wanted).
- ARWIN: from this machine, https://arwin.edwateragency.org/ failed TLS verification with "certificate has expired".
  The link is kept. Please open it in a browser; if it warns, renew the certificate or remove `website:`.
- prismdata docs show `from prism import download_prism`; the package imports as `prismdata`. Worth fixing in the repo.
