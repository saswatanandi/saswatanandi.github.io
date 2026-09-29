---
title: Installing Climate Data Operators (CDO) on Linux from source
description: Tutorial showcasing Climate Data Operators (CDO) installation.
date: 2023-02-16
tags: [cdo, climate, installation, software, tool]
cover: ./cover.jpg
cover_alt: The letters CDO filled with climate maps, above the words Climate Data Operators.
---

> [!NOTE]
> Updated September 2026: the versions below are the ones used in February 2023. The current CDO release is 2.6.4 ([CDO downloads](https://code.mpimet.mpg.de/projects/cdo/files)). The libxml2 source has moved from the old xmlsoft.org FTP server to download.gnome.org, so its download link and extract step are updated.

## Description

Do you work with climate data and find yourself struggling to efficiently manipulate and process your data? Climate Data Operators (CDO) is a powerful tool that can help you analyze and process large amounts of climate data in a fast and efficient way. In this tutorial, I will guide you through the process of installing CDO (and its essential dependencies) on Linux from sources.

## Target Audience

This guide is specifically designed for Linux users who are looking to install the Climate Data Operators (CDO) on their systems. If you are a Windows user, this guide may not be applicable to you. This guide is ideal for High Performance Computing (HPC) users who do not have root privileges on their systems. It is also well-suited for those who are enthusiastic about programming and want to get the most out of their CDO tour.

- Is it suitable for an experienced Linux user? YES
- Is it suitable for a novice Linux user? YES
- How? Answered at the end.

## List of tools that will be installed during the CDO installation

| Name           | Version      |
| :------------- | :----------- |
| zlib           | 1.2.11       |
| HDF5           | 1.12.1       |
| curl           | 7.80.0       |
| netcdf-c       | 4.8.1        |
| netcdf-fortran | 4.5.3        |
| udunits        | 2.2.28       |
| expat          | 2.4.1        |
| libxml2        | 2.9.12       |
| sqlite3        | 2022-3400100 |
| proj           | 8.2.0        |
| CDO            | 1.9.10       |

## Downloading Sources

```bash
wget https://www.zlib.net/fossils/zlib-1.2.11.tar.gz
wget https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.12/hdf5-1.12.1/src/hdf5-1.12.1.tar.gz
wget https://curl.se/download/curl-7.80.0.tar.gz
wget https://github.com/Unidata/netcdf-c/archive/refs/tags/v4.8.1.tar.gz
wget https://github.com/Unidata/netcdf-fortran/archive/refs/tags/v4.5.3.tar.gz
wget https://downloads.unidata.ucar.edu/udunits/2.2.28/udunits-2.2.28.tar.gz
wget https://github.com/libexpat/libexpat/releases/download/R_2_4_1/expat-2.4.1.tar.gz
wget https://download.gnome.org/sources/libxml2/2.9/libxml2-2.9.12.tar.xz
wget https://www.sqlite.org/2022/sqlite-tools-linux-x86-3400100.zip
wget https://download.osgeo.org/proj/proj-8.2.0.tar.gz
wget https://code.mpimet.mpg.de/attachments/download/24638/cdo-1.9.10.tar.gz
```

## Extract Packages

```bash
find . -type f -name '*.tar.gz' -exec tar -xzvf {} \;
tar -xJvf libxml2-2.9.12.tar.xz
unzip sqlite-tools-linux-x86-3400100.zip
```

## Compile Packages

Assuming, we want to install cdo and all its dependencies in a directory defined by a variable **_prefix_**.

Go to the respective package folder and perform the following task

For compiling proj we need to keep the extracted files from sqlite-tools-linux-x86-3400100.zip into any **_PATH_** locations of the system

```bash
# zlib
./configure --prefix=${prefix}
make && make install

# HDF5
./configure --prefix=${prefix} --with-zlib=${prefix} --enable-hl
make && make install

# curl
./configure --prefix=${prefix} --with-zlib=${prefix} --with-gnutls
make && make install

# netcdf-c
./configure --prefix=${prefix} --with-zlib=${prefix} --with-hdf5=${prefix} --enable-netcdf-4 LDFLAGS="-L${prefix}/lib" CPPFLAGS="-I${prefix}/include"
make && make install

# netcdf-fortran
./configure --prefix=${prefix} --with-zlib=${prefix} --with-hdf5=${prefix} --with-netcdf=${prefix} LDFLAGS="-L${prefix}/lib" CPPFLAGS="-I${prefix}/include"
make && make install

# udunits
./configure --prefix=${prefix}
make && make install

# expat
./configure --prefix=${prefix}
make && make install

# xml2
./configure --prefix=${prefix} --with-expat=${prefix} --without-python LDFLAGS="-L${prefix}/lib" CPPFLAGS="-I${prefix}/include"
make && make install

# proj
./configure --prefix=${prefix} LDFLAGS="-L${prefix}/lib" CPPFLAGS="-I${prefix}/include"
make && make install

# cdo
./configure --prefix=${prefix} --with-netcdf=${prefix} --with-hdf5=${prefix} --with-netcdf4 --with-zlib=${prefix} --with-curl=${prefix} --with-udunits2=${prefix} --with-xml2=${prefix} --with-proj=${prefix} LDFLAGS="-L${prefix}/lib" CPPFLAGS="-I${prefix}/include"

make && make install
```

The above code can be further tuned to alter your cdo installation experience.

## Bonus

I have created a bash installation script for CDO that automates the entire installation process and even allows you to take advantage of multiple cores for faster compilation.

The typical form of cdo installation now looks like this (isn't this exciting?):

```text
curl -s url | bash -s arg1 arg2 arg3 arg4
```

### Arguments

When we supply 4 arguments, their meanings are as follows:

```text
Arg 1: "y" or "n". Do you want to create a new directory?
Arg 2: "y" or "n". Do you want parallel make configuration?
Arg 3: Full path name of the new folder to be created
Arg 4: Integer number of CPU cores to use for building packages
```

If Arg 1 and Arg 2 both are 'n', we need only 2 args. In this case cdo will be installed in current working directory with no parallel make.

If Arg 1 = 'y' and If Arg 2 = 'n'; 3rd argument is needed, which is full path name of the new folder to be created.

If Arg 1 = 'n' and If Arg 2 = 'y'; 3rd argument is needed, which is number of CPU cores to use for building.

### Example

A real example using the automated cdo installation script will look something like this:

```bash
curl -s https://gist.githubusercontent.com/iamsaswata/4d1c2bd1711ecb42fede3bedb96f12cc/raw/bb41d9d221751d85fcf731613e1a9e8778e3e372/cdo_install.sh | bash -s y y /tmp/cdo 16
```

### Benefits

The CDO installation script offers several benefits over a manual installation:

- Automation: The script automates the entire installation process, saving you time and effort.
- Customization: The script allows you to customize your installation based on your needs, such as creating a new directory or using parallel make configuration.
- Speed: The script takes advantage of multiple CPU cores for faster compilation, which can significantly speed up the installation process.
