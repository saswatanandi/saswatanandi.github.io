---
title: Modelling a changing water cycle
order: 2
summary: I develop large-scale hydrological models that represent the water cycle as it changes, from soil moisture and evapotranspiration to streamflow, floods and reservoirs.
icon: layers
image: cwis-pipeline
thumbnail: cwis-pipeline-thumb.svg
image_alt: The CWIS workflow in six stages. Data acquisition and assimilation (meteorological, satellite vegetation and AI vegetation-forecast toolboxes) feeds hydrologic simulation with the VIC model at 1 km, daily, and a forecast run. Results are verified against CDEC and SNOTEL stations, with re-calibration when unsatisfactory, stored in a hydrologic data bank with an API, and delivered through a web application.
image_caption: The California Water Information System (CWIS), from data acquisition to the web application.
image_full: /images/research/cwis-flowchart.png
feature:
  title: CWIS
  subtitle: California Water Information System
  description: From satellite vegetation and weather data to daily 1 km simulations of evapotranspiration, soil moisture, snow and streamflow, verified against station observations and delivered through a web application.
  url: '' # TODO(Saswata): add the CWIS link if it becomes public
collaborators: []
funding: []
---

Decisions about water supply, drought and wildfire all depend on knowing how much water is on the land today. Large-scale hydrological models provide this picture, but they usually represent vegetation as static or prescribe it from a fixed seasonal climatology. In a landscape shaped by frequent disturbance, that simplification breaks down, because vegetation governs how much water returns to the atmosphere and how much remains for soils and rivers.

With colleagues, I developed the California Water Information System (CWIS) to address this gap. CWIS is a real-time modelling framework built on the VIC land-surface model and run at 1 km resolution, the finest configuration of its kind at the scale of California. It incorporates satellite observations of vegetation as they become available, allowing the model to capture the hydrological response to natural disturbance. CWIS provides current estimates of soil moisture, evapotranspiration and runoff across the state, supporting drought monitoring and post-fire assessment.

CWIS extends my earlier work in Indian river basins, where I focused on what happens once water leaves the land surface. I developed one of the first frameworks to couple a land-surface model with river-routing and hydrodynamic models, simulating streamflow and floodplain inundation within a single system. I later added reservoir operations to the routing model, bringing human regulation of rivers into the simulation. The broader aim is an integrated representation of the terrestrial water cycle under the joint influence of climate, land cover and human management.
