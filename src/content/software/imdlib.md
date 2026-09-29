---
# Text of /software/imdlib/. Names, links, version, stats and the citation are in
# src/data/software.yaml. `updated` is when this page was last checked against a release.
updated: 2026-09-28
description: IMDLIB is a Python package to download and process the gridded rainfall and temperature data of the India Meteorological Department (IMD).
---

## Description

IMDLIB is a Python package to download and handle the binary gridded data from the India Meteorological Department (IMD). It covers daily rainfall on a 0.25° grid and daily minimum and maximum temperature on a 1° grid, reads them into [xarray](https://docs.xarray.dev/), and saves them as CSV, NetCDF or GeoTIFF.

## Installation

IMDLIB can be installed with conda, with pip, or from the source on GitHub. It is tested on Windows and Linux (64-bit).

With conda:

```bash
conda install -c conda-forge imdlib
```

With pip:

```bash
pip install imdlib
```

From the source on GitHub:

```bash
pip install git+https://github.com/iamsaswata/imdlib.git
```

> **Updated September 2026.** IMDLIB is now on conda-forge (the `iamsaswata` channel still works). Version 0.1.22 needs Python 3.10 or newer and pandas 2.2 or newer. conda and pip install the other dependencies (numpy, xarray, scipy, matplotlib, requests and a few small ones), so the old table of pinned versions is gone. For GeoTIFF output, also install `rioxarray`.

## Usage

### Downloading data from IMD

IMDLIB can download gridded rainfall and temperature (minimum and maximum) data from [IMD Pune](https://imdpune.gov.in/).

```python
import imdlib as imd

# Download 9 years of rainfall data for India
start_yr = 2010
end_yr = 2018
variable = 'rain'  # other options are 'tmin' and 'tmax'
file_dir = 'dataFolder'
data = imd.get_data(variable, start_yr, end_yr, fn_format='yearwise', file_dir=file_dir)
```

The options of `get_data`:

- `fn_format`: the file name format. `None` (the default) keeps the IMD file names. `'yearwise'` renames the files to `<year>.grd`, for example `2018.grd`.
- `file_dir`: the folder for the downloaded files. If `None`, the current working directory is used.
- `sub_dir`: `True` puts each variable in its own subfolder. `False` saves the files directly in `file_dir`.
- `proxies`: proxy settings, for example `{'http': 'http://uname:password@ip:port'}`.

`get_data` returns the same IMD object as `open_data` below. Files that are already in `file_dir` are not downloaded again.

### Reading downloaded data

One major purpose of IMDLIB is to process the gridded IMD meteorological datasets. The original data is in the binary `.grd` format. IMDLIB reads the `.grd` files and creates an *IMD class* object. For data you have already downloaded, use `imd.open_data()`.

```python
import imdlib as imd

start_yr = 2018
end_yr = 2018
variable = 'rain'         # other options are 'tmin' and 'tmax'
file_format = 'yearwise'  # or None for the IMD file names
file_dir = '/home/data/imd'
data = imd.open_data(variable, start_yr, end_yr, file_format, file_dir)
data
```

```text
<imdlib.core.IMD at 0x7f39b0960750>
```

- `file_dir` should be the top-level folder. It should contain three subfolders: `rain`, `tmin` and `tmax`.
- If `file_dir` exists but has no subfolders, IMDLIB looks for the files in `file_dir` itself. Be careful with `'yearwise'` file names: IMDLIB cannot tell `2018.grd` for rainfall from `2018.grd` for tmin.
- If `file_dir` is not given, IMDLIB looks for the subfolders and files in the current directory.

### Shape of the IMD object

```python
data.shape
```

```text
(365, 135, 129)
```

The dimensions are days, longitudes and latitudes.

### NumPy array

```python
np_array = data.data
```

### xarray object

```python
ds = data.get_xarray()
type(ds)
```

```text
xarray.core.dataset.Dataset
```

### Mean rainfall map

```python
ds['rain'].mean('time').plot()
```

![Map of India coloured by mean daily rainfall, lowest in the north-west and highest on the west coast and in the north-east.](./images/imdlib-mean-rainfall.png)

> **Updated September 2026.** `get_xarray()` now masks the missing values (−999) itself, so the earlier `ds.where(ds['rain'] != -999.)` step is no longer needed. The picture is from an earlier version; current versions label the axes and colour bar with names and units.

### Processing and saving

```python
out_dir = '/home/downloads/data'

# Time series at one grid point, saved as CSV
lat = 20.03
lon = 77.23
data.to_csv('rain.csv', lat, lon, out_dir)   # writes rain_20.03_77.23.csv

# Convert to a NetCDF file
data.to_netcdf('rain.nc', out_dir)

# Convert to a GeoTIFF file
data.to_geotiff('rain.tif', out_dir)
```

For GeoTIFF output IMDLIB uses the [rioxarray](https://corteva.github.io/rioxarray/stable/) package, which is not a dependency of IMDLIB. When `to_geotiff()` is called, IMDLIB checks whether rioxarray is installed. If it is, the GeoTIFF file is written. If not, you get an error saying that rioxarray is not installed.

### More functions

> **Updated September 2026.** This section is new. Since the first version of this page, IMDLIB has added:

- real-time daily data (rainfall at 0.25°, temperature at 0.5°): `imd.get_real_data()` and `imd.open_real_data()`, with dates such as `'2020-01-31'`;
- annual climate indices, for example rainy days, consecutive dry and wet days, heavy rainfall days, maximum 1-day and 5-day rainfall, and the diurnal temperature range, with trend tests (modified Mann-Kendall, Spearman's rho, Sen's slope);
- the drought indices SPI and SPEI;
- heat wave and cold wave days following the IMD criteria: `heatwave()` and `coldwave()`;
- monthly climatology and anomalies: `climatology()` and `anomaly()`;
- clipping to a shapefile (`clip()`), area-weighted spatial means (`spatial_mean()`), filling gaps (`fill_na()`) and regridding (`remap()`).

```python
rain = imd.open_data('rain', 1991, 2020, 'yearwise', file_dir)

# compute() changes the object in place, so work on a copy
heavy = rain.copy().compute('d64', 'A', threshold=64.5)   # heavy rainfall days per year
spi3 = rain.copy().compute('spi', 'M', timescale=3)       # 3-month SPI
```

The [documentation](https://imdlib.readthedocs.io) lists every index and option.

### NetCDF file convention

IMDLIB writes its final output as netCDF (network Common Data Form), the format most commonly used for climate model data. It follows the netCDF Climate and Forecast (CF) Metadata Conventions, version 1.7, so the files work with other standard netCDF tools. The CRS is `epsg:4326`; `to_geotiff` needs it to work correctly. For more on the CF conventions, see the [CF Conventions home page](https://cfconventions.org) and the [cf_xarray](https://cf-xarray.readthedocs.io/) documentation on using CF with xarray.

```text
test@test:~/data$ ncdump -h test.nc
netcdf test {
dimensions:
	time = 365 ;
	lat = 31 ;
	lon = 31 ;
variables:
	double tmax(time, lat, lon) ;
		tmax:_FillValue = NaN ;
		tmax:units = "C" ;
		tmax:long_name = "Maximum Temperature" ;
	double lat(lat) ;
		lat:_FillValue = NaN ;
		lat:axis = "Y" ;
		lat:standard_name = "latitude" ;
		lat:long_name = "latitude" ;
		lat:units = "degrees_north" ;
	double lon(lon) ;
		lon:_FillValue = NaN ;
		lon:axis = "X" ;
		lon:long_name = "longitude" ;
		lon:units = "degrees_east" ;
	int64 time(time) ;
		time:standard_name = "time" ;
		time:long_name = "time" ;
		time:units = "days since 2010-01-01" ;
		time:calendar = "proleptic_gregorian" ;

// global attributes:
		:Conventions = "CF-1.7" ;
		:title = "IMD gridded data" ;
		:source = "https://imdpune.gov.in/" ;
		:history = "2020-12-29 22:16:07.359709 Python" ;
		:references = "" ;
		:comment = "" ;
		:crs = "epsg:4326" ;
}
```
