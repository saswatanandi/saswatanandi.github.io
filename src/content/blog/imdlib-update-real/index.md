---
title: Real time data processing using IMDLIB
description: Tutorial showcasing IMDLIB for real-time data processing.
date: 2023-01-12
tags: [imdlib, imd, hydrology, software, github, pypi, conda]
cover: ./cover.png
cover_alt: Map of daily rainfall over India from IMD gridded data, plotted with IMDLIB.
---

## Description

Tutorial showcasing IMDLIB for real-time data processing.

## Installation

IMDLIB can be installed via pip, conda, or using the source file from Github. It is tested for both Windows and Linux platforms with 64 bit architecture only.

Installation using pip.

```bash
pip install imdlib
```

Installation using conda.

```bash
conda install -c iamsaswata imdlib
```

Installation from source file.

```bash
pip install git+https://github.com/iamsaswata/imdlib.git
```

## Usage

### Downloading real-time data from IMD

IMDLIB, with its v.0.1.15, now supports processing of real-time daily IMD rainfall 0.25° and temperature data 0.50°.

The steps are similar to the data downloading and opening of IMD gridded archive data.

An example is presented below.

```python
import imdlib as imd

# Downloading daily real-time rainfall data for India
import imdlib as imd
start_dy = '2020-01-31'
end_dy = '2020-03-05'
var_type = 'rain'
file_dir='../data'
data = imd.get_real_data(var_type, start_dy, end_dy, file_dir)
```

The output is:

```text
    Downloading: rain for date 2020-01-31
    Downloading: rain for date 2020-02-01
    Downloading: rain for date 2020-02-02
    Downloading: rain for date 2020-02-03
    Downloading: rain for date 2020-02-04
    Downloading: rain for date 2020-02-05
    Downloading: rain for date 2020-02-06
    Downloading: rain for date 2020-02-07
    Downloading: rain for date 2020-02-08
    Downloading: rain for date 2020-02-09
    Downloading: rain for date 2020-02-10
    Downloading: rain for date 2020-02-11
    Downloading: rain for date 2020-02-12
    Downloading: rain for date 2020-02-13
    Downloading: rain for date 2020-02-14
    Downloading: rain for date 2020-02-15
    Downloading: rain for date 2020-02-16
    Downloading: rain for date 2020-02-17
    Downloading: rain for date 2020-02-18
    Downloading: rain for date 2020-02-19
    Downloading: rain for date 2020-02-20
    Downloading: rain for date 2020-02-21
    Downloading: rain for date 2020-02-22
    Downloading: rain for date 2020-02-23
    Downloading: rain for date 2020-02-24
    Downloading: rain for date 2020-02-25
    Downloading: rain for date 2020-02-26
    Downloading: rain for date 2020-02-27
    Downloading: rain for date 2020-02-28
    Downloading: rain for date 2020-02-29
    Downloading: rain for date 2020-03-01
    Downloading: rain for date 2020-03-02
    Downloading: rain for date 2020-03-03
    Downloading: rain for date 2020-03-04
    Downloading: rain for date 2020-03-05
    Download Successful !!!
```

### Reading downloaded real-time dataset

```python
import imdlib as imd
start_dy = '2020-01-31'
end_dy = '2020-03-05'
var_type = 'rain'
file_dir='../data'
data = imd.open_real_data(var_type, start_dy, end_dy, file_dir)
```
