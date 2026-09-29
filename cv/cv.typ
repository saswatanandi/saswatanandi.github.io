// ─────────────────────────────────────────────────────────────────────────────
//  PDF CV. Content comes from build/cv-data.json, written by scripts/build-cv-data.mjs
//  from src/data/cv.yaml + site.config.yaml + src/data/publications.bib.
//  Don't put CV content here: edit cv.yaml. This file is only the design.
//
//  Build:  npm run cv:pdf        (→ public/cv.pdf)
//  Paper:  set `pdf.paper` in cv.yaml, or override with  --input paper=a4
//  Needs Typst ≥ 0.12 and the fonts in cv/fonts/ (passed with --font-path).
// ─────────────────────────────────────────────────────────────────────────────

#let data = json("build/cv-data.json")
#let paper = sys.inputs.at("paper", default: data.paper)

// Colours: the site's "Topographic" palette (src/styles/tokens.css).
#let accent = rgb("#0f6e56")
#let ink = rgb("#1b2a33")
#let muted = rgb("#45565f")
#let faint = rgb("#5d6d76")
#let hair = rgb("#c3d0d6")

#let serif = ("Source Serif 4", "Libertinus Serif")
#let sans = ("Inter",)
#let date-col = 0.95in
#let gutter = 12pt

#let person = data.person
#set document(title: person.name + " — Curriculum Vitae", author: person.name)

#set page(
  paper: paper,
  margin: (x: 0.8in, top: 0.75in, bottom: 0.7in),
  header: context {
    if here().page() > 1 {
      set text(font: sans, size: 7.5pt, fill: faint)
      grid(columns: (1fr, auto), person.name, [Curriculum vitae])
      v(-1pt)
      line(length: 100%, stroke: 0.4pt + hair)
    }
  },
  footer: context {
    set text(font: sans, size: 7.5pt, fill: faint)
    grid(
      columns: (1fr, auto),
      [Updated #data.updated],
      [#here().page() / #counter(page).final().first()],
    )
  },
)

#set text(font: serif, size: 10pt, fill: ink, lang: "en", number-type: "lining")
#set par(leading: 0.52em, spacing: 0.6em)

// ── Building blocks ─────────────────────────────────────────────────────────

#let meta(body) = text(font: sans, size: 8pt, fill: faint, body)

#let section-head(title) = block(above: 13pt, below: 7pt, sticky: true)[
  #set text(font: sans, size: 8.5pt, weight: "bold", fill: accent, tracking: 0.09em)
  #grid(
    columns: (auto, 1fr),
    column-gutter: 8pt,
    align: horizon,
    upper(title), line(length: 100%, stroke: 0.5pt + hair),
  )
]

// Sub-heading inside a section (e.g. "Journal articles"), aligned with the text column.
#let group-head(title) = block(above: 9pt, below: 5pt, sticky: true, inset: (left: date-col + gutter))[
  #text(font: sans, size: 8pt, weight: "semibold", fill: muted, title)
]

// Date column + content column.
#let entry(left, body, col: date-col, below: 6pt) = block(
  breakable: false,
  above: 0pt,
  below: below,
  grid(columns: (col, 1fr), column-gutter: gutter, left, body),
)

#let maybe-link(url, body) = if url == none { body } else { link(url, body) }

// Label | text rows (skills, interests) get a wider label column.
#let label-col = 1.55in
#let row(r, plain: false) = entry(
  col: if plain { label-col } else { date-col },
  if plain {
    text(font: sans, size: 8pt, weight: "medium", fill: muted, r.at("when", default: ""))
  } else { meta(r.at("when", default: "")) },
  {
    text(weight: if plain { "regular" } else { "semibold" }, maybe-link(r.at("url", default: none), r.title))
    for (i, l) in r.lines.enumerate() {
      linebreak()
      let u = if i == 0 { r.at("lineUrl", default: none) } else { none }
      text(size: 9.5pt, fill: muted, maybe-link(u, l))
    }
    let bullets = r.at("bullets", default: ())
    if bullets.len() > 0 {
      set text(size: 9.5pt, fill: muted)
      set list(marker: text(fill: accent, size: 7pt, baseline: -1pt, sym.diamond.filled), indent: 1pt, body-indent: 6pt, spacing: 0.45em)
      block(above: 4pt, below: 0pt, list(..bullets))
    }
  },
)

// Publications: plain numbers (1 = newest, restarting in each group), right-aligned
// against the citation; the owner's name in bold.
#let pub(p) = entry(
  below: 4.5pt,
  align(right, text(font: sans, size: 8pt, weight: "semibold", fill: accent, p.label)),
  {
    set text(size: 9.5pt)
    for a in p.authors {
      if a.self { text(weight: "bold", a.name) } else { a.name }
      a.sep
    }
    [ (#p.year). ]
    maybe-link(p.at("url", default: none), p.title)
    if p.title.last() not in (".", "?", "!") [.]
    [ ]
    if p.at("venue", default: none) != none { emph(p.venue) }
    if p.at("details", default: none) != none [, #p.details]
    [.]
  },
)

// ── Header ──────────────────────────────────────────────────────────────────

#block(below: 14pt)[
  #text(size: 24pt, weight: "semibold", tracking: -0.01em, person.name)
  #v(1pt)
  #text(font: sans, size: 9.5pt, fill: muted)[
    #person.role
    #if person.affiliation != none [
      #h(3pt) · #h(3pt) #maybe-link(person.affiliation_url, person.affiliation)
    ]
    #if person.location != none [ #h(3pt) · #h(3pt) #person.location ]
  ]
  #v(2pt)
  #text(font: sans, size: 8pt, fill: muted)[
    #show link: set text(fill: muted)
    #data.contacts.map(c => box(link(c.url, c.label))).join(h(5pt) + text(fill: accent, "·") + h(5pt))
  ]
  #v(3pt)
  #line(length: 100%, stroke: 1.2pt + accent)
]

#if data.summary != none {
  block(below: 4pt, text(size: 10pt, data.summary.map(x => if x.bold { text(weight: "semibold", x.text) } else { x.text }).join()))
}

// ── Sections ────────────────────────────────────────────────────────────────

#for s in data.sections {
  section-head(s.title)
  for g in s.groups {
    if g.at("heading", default: none) != none { group-head(g.heading) }
    if s.kind == "pubs" {
      for p in g.entries { pub(p) }
    } else {
      for r in g.rows { row(r, plain: s.id in data.plain) }
      let items = g.at("list", default: ())
      if items.len() > 0 {
        let note = g.at("note", default: none)
        entry([], {
          text(size: 9.5pt, items.join("  ·  "))
          if note != none { text(size: 9.5pt, fill: muted, [ #note]) }
        })
      }
    }
  }
}
