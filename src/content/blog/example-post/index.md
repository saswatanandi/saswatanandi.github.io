---
title: Example post (copy me)
description: A template showing the front-matter fields every post uses. It is a draft, so it never appears on the live site.
date: 2026-09-27
tags: [example]
draft: true
# Optional:
# updated: 2026-10-01
# series: IMDLIB tutorials       # posts with the same series name are linked together
# cover: ./cover.jpg             # a picture in this folder, shown under the title
# cover_alt: What the picture shows
# toc: false                     # hide the contents list
# comments: false                # no comment box on this post
---

This is an **example draft**. Copy this folder to `src/content/blog/<your-slug>/`, edit the
front matter above, set `draft: false` and commit. Images go next to `index.md`.

## Maths

Inline maths goes between single dollar signs: the runoff coefficient is $C = Q / P$.
Display maths goes between double dollar signs:

$$
\frac{dS}{dt} = P - ET - Q
$$

## Code

```python
import imdlib as imd

data = imd.open_data('rain', 2020, 2021, 'yearwise', '../data')
```

## Pictures and notes

A picture with a caption: `![What it shows](./figure.png "The caption")`.

> [!NOTE]
> A note box. Also `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` and `[!CAUTION]`.
