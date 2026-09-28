// Writes the theme-2 second figure (VIC → RAPID → LISFLOOD-FP chain) into the site:
//   src/assets/research/model-chain-india.svg         wide: labels on the drawing
//   src/assets/research/model-chain-india.narrow.svg  phones: numbered dots + legend
import { writeFileSync } from 'node:fs';
import { drawA } from './india-draw.mjs';

const OUT = new URL('../../src/assets/research/', import.meta.url).pathname;
const T = [
  { n: 1, x: 6, name: 'VIC', role: 'land surface', long: 'land surface: runoff and baseflow' },
  { n: 2, x: 250, name: 'RAPID', role: 'river routing', long: 'river routing, with reservoirs' },
  { n: 3, x: 466, name: 'LISFLOOD-FP', role: 'floodplain', long: 'floodplain inundation' },
];
const labelCss = (p, fs) => `
.${p}-tn{fill:var(--color-accent,#0f6e56)}
.${p}-tnt{font:700 ${Math.round(fs * 0.72)}px var(--font-body,Inter,system-ui,sans-serif);fill:var(--color-on-accent,#fff)}
.${p}-tt{font:500 ${fs}px var(--font-body,Inter,system-ui,sans-serif);fill:var(--color-text-muted,#45565f);paint-order:stroke;stroke:var(--color-surface,#fff);stroke-width:6px;stroke-linejoin:round}
.${p}-tt tspan.b{font-weight:700;fill:var(--color-text,#1b2a33)}`;
const dot = (p, x, y, n, r) => `<circle class="${p}-tn" cx="${x}" cy="${y}" r="${r}"/><text class="${p}-tnt" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${n}</text>`;

// wide
{
  const p = 'mci';
  let s = drawA(p, 360);
  s = s.replace('</style>', labelCss(p, 16) + '</style>');
  for (const t of T) s += dot(p, t.x + 11, 346, t.n, 11) + `<text class="${p}-tt" x="${t.x + 28}" y="346" dominant-baseline="central"><tspan class="b">${t.name}</tspan> ${t.role}</text>`;
  writeFileSync(OUT + 'model-chain-india.svg', s + '</svg>\n');
  console.log('wide', Buffer.byteLength(s));
}
// narrow: same drawing, dots on it, legend underneath at phone-readable size
{
  const p = 'mcn';
  const H = 520;
  let s = drawA(p, H);
  s = s.replace('</style>', labelCss(p, 30) + '</style>');
  for (const t of T) s += dot(p, t.x + 40, 346, t.n, 17);
  T.forEach((t, k) => {
    const y = 404 + k * 44;
    s += dot(p, 26, y, t.n, 17) + `<text class="${p}-tt" x="56" y="${y}" dominant-baseline="central" style="stroke:none"><tspan class="b">${t.name}</tspan> ${t.long}</text>`;
  });
  writeFileSync(OUT + 'model-chain-india.narrow.svg', s + '</svg>\n');
  console.log('narrow', Buffer.byteLength(s));
}
