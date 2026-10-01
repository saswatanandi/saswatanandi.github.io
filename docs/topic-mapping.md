# Paper → research theme mapping

Each BibTeX entry gets `topic = {…}` with one or more theme slugs, comma-separated.
Slugs are the file names in `src/content/research/`:

| Slug | Theme |
| --- | --- |
| `fire-and-water` | Fire and water in mountain watersheds |
| `modelling-water-cycle` | Modelling a changing water cycle |
| `climate-extremes` | Climate extremes and water security |

A paper appears on every theme page it is tagged with (newest first). An unknown slug stops the build
with a message listing the valid ones.

Status: all entries below are in `publications.bib` with this tagging; ✅ = the four selected papers.

| Year | Paper (short) | Venue | `topic` |
| --- | --- | --- | --- |
| 2026 | Kandhway et al. — crop ET methods, San Joaquin Valley ✅ | Frontiers in Water | `modelling-water-cycle` |
| 2025 | Chakraborty et al. — drought characteristics and water-use efficiency across CONUS | AGU abstract | `climate-extremes, fire-and-water` |
| 2025 | Datta, Reddy & Nandi — VIC-3L and D-vine copulas, runoff and hydrological drought, Upper Bhima | J. Water & Climate Change | `climate-extremes, modelling-water-cycle` |
| 2025 | Jha et al. — climate change in agriculture, adaptation and extreme events (editorial) | Frontiers in Env. Science | `climate-extremes` |
| 2025 | Casirati et al. — forest management and water balance, upper Kings River ✅ | Ecohydrology | `fire-and-water` |
| 2024 | Nandi & Safeeq — how wildfires alter ET in California | AGU abstract | `fire-and-water` |
| 2024 | Khan et al. — forest thinning and long-term water balance, mixed-conifer basin | AGU abstract | `fire-and-water` |
| 2024 | Nandi & Swain — groundwater and SDG6/SDG13 | Curr. Opin. Env. Sci. & Health | `climate-extremes` |
| 2024 | Swain et al. — hydrological droughts from GloFAS streamflow, Narmada | ESPR | `climate-extremes` |
| 2024 | Nandi & Reddy — projected water balance under climate change with storage structures | J. Water & Climate Change | `modelling-water-cycle, climate-extremes` |
| 2024 | Swain et al. — meteorological drought monitoring, Rajasthan | Applied Water Science | `climate-extremes` |
| 2024 | Nandi, Patel & Swain — IMDLIB ✅ | Env. Modelling & Software | `modelling-water-cycle` |
| 2023 | Nandi & Reddy — multimodel precipitation and streamflow forecasts, Upper Bhima | Hydrol. Sci. J. | `modelling-water-cycle` |
| 2023 | Nandi & Swain — heatwaves under CMIP6, three South Indian cities | ESPR | `climate-extremes` |
| 2023 | Nandi & Swain — TIGGE multimodel ensemble streamflow forecasts | IUGG abstract | `modelling-water-cycle` |
| 2022 | Nandi & Reddy — bias-corrected IMERG for hydrological simulation | Geocarto International | `modelling-water-cycle` |
| 2022 | Nandi & Swain — flood risk hotspots under CMIP6, Mahanadi | AGU abstract | `climate-extremes` |
| 2022 | Datta, Reddy & Nandi — regional severity–duration–frequency curves | AGU abstract | `climate-extremes` |
| 2022 | Nandi & Reddy — VIC, RAPID and LISFLOOD-FP streamflow and inundation ✅ | J. Hydrology | `modelling-water-cycle` |
| 2021 | Nandi & Reddy — VIC-RAPID parameter estimation with SaDE | SNC 2021 proceedings | `modelling-water-cycle` |
| 2021 | Nandi & Reddy — multiobjective calibration with MOSaDE | Book chapter (Springer) | `modelling-water-cycle` |
| 2020 | Nandi & Reddy — macroscale model parameter estimation, adaptive DE | Book chapter (Springer) | `modelling-water-cycle` |
| 2020 | Nandi & Manne — water balance and projected changes, Sina Basin | Water Resources Management | `modelling-water-cycle, climate-extremes` |
| 2020 | Nandi & Reddy — SaDE vs GA, SCE and DE for calibration | H2Open Journal | `modelling-water-cycle` |
| 2018 | Nandi & Reddy — satellite rainfall for daily streamflow, small tropical catchment | IGARSS 2018 | `modelling-water-cycle` |
| 2018 | Swain, Nandi & Patel — ARIMA monthly rainfall forecasting, Khordha | Book chapter (Springer) | `modelling-water-cycle` |
| 2017 | Swain, Patel & Nandi — SPI, EDI and PNPI with MSWEP, Marathwada | IGARSS 2017 | `climate-extremes` |
| 2017 | Swain, Patel & Nandi — multiple linear regression precipitation forecasting, Cuttack | I2CT 2017 | `modelling-water-cycle` |
| 2017 | Nandi & Reddy — distributed rainfall–runoff modelling, Krishna basin | European Water | `modelling-water-cycle` |

Notes
- Two papers fit the rule list less directly and are tagged by analogy: the SPI/EDI/PNPI drought-index paper
  (→ drought, `climate-extremes`) and the multiple-linear-regression precipitation forecast
  (→ forecasting, like the ARIMA paper, `modelling-water-cycle`). The Krishna rainfall–runoff paper is a
  hydrological-modelling paper (`modelling-water-cycle`). Change any of these freely.
