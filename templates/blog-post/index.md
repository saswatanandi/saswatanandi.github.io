---
# BLOG POST TEMPLATE: copy this file to src/content/blog/<post-name>/index.md
# (the folder name becomes the address /blog/<post-name>/). Pictures go in the same folder.
title: Post title
description: One or two sentences about the post (shown in lists and on social cards).
date: 2026-10-10                  # YYYY-MM-DD
tags: [python]
# draft: true                   # hide it on the live site while you write
# Optional:
# updated: 2026-10-01
# series: IMDLIB tutorials       # posts with the same series name are linked together
# cover: ./cover.jpg             # a picture in this folder, shown under the title
# cover_alt: What the picture shows
# toc: false                     # hide the contents list
# comments: false                # no comment box on this post
---

Write the post here. The sections below show what you can use; delete what you do not need.

## Maths

Inline maths goes between single dollar signs: the runoff coefficient is $C = Q / P$.
Display maths goes between double dollar signs:

$$
\frac{dS}{dt} = P - ET - Q
$$

## Code

```python
import imdlib as imd

data = imd.load('rain', 2020, 2021)
```

## Pictures and notes

A picture with a caption: `![What it shows](./figure.png "The caption")`.

> [!NOTE]
> A note box. Also `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` and `[!CAUTION]`.
