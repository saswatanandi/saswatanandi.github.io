---
title: Modelling a changing water cycle
order: 2
summary: I develop large-scale hydrological models that represent the water cycle as it changes, from soil moisture and evapotranspiration to streamflow, floods and reservoirs.
icon: layers
image: cwis-pipeline
thumbnail: modelling-water-cycle-card.svg
figures:
  - image: model-chain-india.svg
    alt: Schematic landscape of the coupled modelling chain. On a forested hillslope divided into grid cells with soil layers, rain falls and water evaporates; runoff and baseflow from the land-surface model VIC drain to a river. The river routing model RAPID carries the flow through a reservoir behind a dam, and the hydrodynamic model LISFLOOD-FP spreads the water beyond the river banks across a floodplain with houses.
    caption: Coupling a land-surface model (VIC) with river routing (RAPID) and floodplain hydraulics (LISFLOOD-FP).
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

Large-scale hydrological models usually treat vegetation as fixed, either static or prescribed from a seasonal climatology. Yet vegetation changes after wildfire and drought mortality, under forest treatments such as thinning and prescribed burning, and with changes in cropping and irrigation. It also keeps changing as landscapes recover. Because vegetation governs how much water returns to the atmosphere and how much remains for soils and rivers, a model that holds it fixed misses both the loss and the recovery.

With colleagues, I developed the California Water Information System (CWIS) to address this gap. CWIS is a real-time modelling framework built on the VIC land-surface model and run at 1 km resolution, the finest configuration of its kind at the scale of California. It incorporates satellite observations of vegetation as they become available, allowing the model to capture the hydrological response to natural disturbance. CWIS provides current estimates of soil moisture, evapotranspiration, snow water equivalent and runoff across the state, supporting drought monitoring and post-fire assessment.

<!-- figure -->

CWIS extends my earlier work in Indian river basins. There, I developed one of the first frameworks to couple a land-surface model with river-routing and hydrodynamic models, simulating streamflow and floodplain inundation within a single system. I later added reservoir operations to the routing model, bringing human regulation of rivers into the simulation. The broader aim is an integrated representation of the terrestrial water cycle under the joint influence of climate, land cover and human management.

<!-- figure 2 -->
