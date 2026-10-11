---
title: Modelling a changing water cycle
order: 2
summary: Vegetation and rivers change through disturbance and human management, and coupled models that follow these changes link soil moisture and evapotranspiration to streamflow, floods and reservoirs.
image: cwis-pipeline
thumbnail: modelling-water-cycle-card.svg
figures:
  - image: model-chain-india.svg
    alt: Schematic landscape of the coupled modelling chain. On a forested hillslope divided into grid cells with soil layers, rain falls and water evaporates; runoff and baseflow from the land-surface model VIC drain to a river. The river routing model RAPID carries the flow through a reservoir behind a dam, and the hydrodynamic model LISFLOOD-FP spreads the water beyond the river banks across a floodplain with houses.
    caption: Coupling a land-surface model (VIC) with river routing (RAPID) and floodplain hydraulics (LISFLOOD-FP).
image_alt: The CWIS workflow in six stages. Data acquisition and assimilation (meteorological, satellite vegetation and AI vegetation-forecast toolboxes) feeds hydrologic simulation with the VIC model at 1 km, daily, and a forecast run. Results are verified against CDEC and SNOTEL stations, with re-calibration when unsatisfactory, stored in a hydrologic data bank with an API, and delivered through a web application.
image_caption: The California Water Information System (CWIS), from data acquisition to the web application.
collaborators: []
funding: []
---

Large-scale hydrological models usually treat vegetation as fixed, prescribed from a seasonal climatology that repeats each year. Vegetation, however, changes after wildfire and drought mortality, under forest treatments such as thinning and prescribed burning, and with shifts in cropping and irrigation, and it keeps changing as landscapes recover. Because vegetation governs how much water returns to the atmosphere and how much remains for soils and rivers, a model that holds it fixed misses both the loss and the recovery.

My current work addresses this gap through the California Water Information System (CWIS). CWIS is a real-time modelling framework built on the VIC land-surface model and run at 1 km resolution across California. It assimilates satellite observations of vegetation as they become available, so the simulated water balance follows the landscape through disturbance, management and recovery. The system provides current estimates of soil moisture, evapotranspiration, snow water equivalent and runoff across the state, supporting drought monitoring and post-fire assessment.

<!-- figure -->

CWIS builds on my earlier work in Indian river basins, where I coupled the VIC land-surface model with the RAPID river-routing model and the LISFLOOD-FP hydrodynamic model, so that streamflow and floodplain inundation could be simulated within a single system. I later added reservoir operations to the routing model, bringing human regulation of rivers into the simulation. Together, these efforts work toward an integrated representation of the terrestrial water cycle, shaped jointly by climate, land cover and human management.

<!-- figure 2 -->
