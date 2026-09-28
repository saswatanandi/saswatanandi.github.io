// Theme 3 figure: an atmospheric river (AR) making landfall in California, with the
// ENSO (Niño 3.4) and positive-PDO sea-surface-temperature patterns. Writes
//   src/assets/research/climate-extremes.svg         wide, labelled (theme page)
//   src/assets/research/climate-extremes.narrow.svg  phones (< 30rem)
//   src/assets/research/climate-extremes-card.svg    label-free card thumbnail
// Run: node scripts/figures/make-ar-map.mjs
//
// Geography: Natural Earth 1:50m land and countries (public domain) via the `world-atlas`
// package; US state outlines from the US Census Bureau cartographic boundary files
// (public domain) via `us-atlas`. The IVT and SST-anomaly fields are SYNTHETIC: analytic
// shapes chosen to resemble a reanalysis composite, for illustration only — not data.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoMercator, geoPath, geoGraticule } from 'd3-geo';
import { contours } from 'd3-contour';
import { feature, mesh } from 'topojson-client';

const require = createRequire(import.meta.url);
const OUT = new URL('../../src/assets/research/', import.meta.url).pathname;
const load = (p) => JSON.parse(readFileSync(require.resolve(p), 'utf8'));

const landTopo = load('world-atlas/land-50m.json');
const countriesTopo = load('world-atlas/countries-50m.json');
const statesTopo = load('us-atlas/states-10m.json');
const land = feature(landTopo, landTopo.objects.land);
const borders = mesh(countriesTopo, countriesTopo.objects.countries, (a, b) => a !== b);
const stateLines = mesh(statesTopo, statesTopo.objects.states, (a, b) => a !== b);
const california = feature(statesTopo, statesTopo.objects.states).features.find((f) => f.properties.name === 'California');

// ───────────────────────────── synthetic fields ─────────────────────────────
const D2R = Math.PI / 180;
const KM = 111.2; // km per degree of latitude

// Catmull-Rom densified AR axis (lon, lat), from the subtropics near Hawaiʻi to landfall
// on the central California coast (~38.3°N, 123°W) and on across the Sierra Nevada.
const AXIS_CTRL = [
  [-182, 10.0], [-172, 12.6], [-163, 15.3], [-154, 18.6], [-145.5, 22.6], [-138, 27.0],
  [-131.5, 31.6], [-126.5, 35.4], [-123.1, 38.3], [-119.8, 39.8], [-114, 41.2],
];
function catmull(pts, n = 24) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const AXIS = catmull(AXIS_CTRL);
// cumulative along-axis distance (km)
const AXIS_S = [0];
for (let i = 1; i < AXIS.length; i++) {
  const [a, b] = [AXIS[i - 1], AXIS[i]];
  const c = Math.cos(((a[1] + b[1]) / 2) * D2R);
  AXIS_S.push(AXIS_S[i - 1] + Math.hypot((b[0] - a[0]) * c, b[1] - a[1]) * KM);
}
const AXIS_LEN = AXIS_S[AXIS_S.length - 1];
const LANDFALL_S = (() => {
  let best = 0, d = 1e9;
  AXIS.forEach((p, i) => { const e = Math.hypot(p[0] + 123, p[1] - 38.3); if (e < d) { d = e; best = i; } });
  return AXIS_S[best];
})();

// nearest point on the axis: signed cross distance (km, + = equatorward/east side), along distance
function axisCoords(lon, lat) {
  const c = Math.cos(lat * D2R);
  let best = { d: Infinity, s: 0, side: 1, i: 0 };
  for (let i = 0; i < AXIS.length - 1; i++) {
    const [a, b] = [AXIS[i], AXIS[i + 1]];
    const ax = (a[0] - lon) * c * KM, ay = (a[1] - lat) * KM;
    const bx = (b[0] - lon) * c * KM, by = (b[1] - lat) * KM;
    const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy;
    const t = Math.max(0, Math.min(1, -(ax * vx + ay * vy) / L2));
    const px = ax + t * vx, py = ay + t * vy;
    const d = Math.hypot(px, py);
    if (d < best.d) {
      // cross product of segment direction with (point - nearest): >0 → point to the right (SE side)
      const side = vx * -py - vy * -px < 0 ? 1 : -1;
      best = { d, s: AXIS_S[i] + t * Math.sqrt(L2), side, i };
    }
  }
  return best;
}
const smooth = (x, a, b) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// deterministic smooth value noise in [-1, 1] (lon/lat in degrees, `sc` = feature size in degrees)
function noise(lon, lat, sc, seed) {
  const h = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453; return 2 * (x - Math.floor(x)) - 1; };
  const x = lon / sc, y = lat / sc, i = Math.floor(x), j = Math.floor(y);
  const u = x - i, v = y - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
  return (h(i, j) * (1 - su) + h(i + 1, j) * su) * (1 - sv) + (h(i, j + 1) * (1 - su) + h(i + 1, j + 1) * su) * sv;
}
const fbm = (lon, lat, sc, seed) => 0.6 * noise(lon, lat, sc, seed) + 0.3 * noise(lon, lat, sc / 2.1, seed + 7) + 0.1 * noise(lon, lat, sc / 4.3, seed + 13);

// Integrated vapour transport, kg m⁻¹ s⁻¹
function ivt(lon, lat) {
  const a = axisCoords(lon, lat);
  const { s, side } = a;
  // ragged edges: perturb the cross-stream distance with smooth multi-scale noise
  const d = Math.max(0, a.d + 170 * fbm(lon, lat, 6.5, 1) + 60 * noise(lon, lat, 2.2, 2));
  // core strength along the river: builds from the tropics, peaks offshore, orographic decay inland
  let peak = 300 + 680 * smooth(s, 0, 0.45 * AXIS_LEN) - 110 * smooth(s, 0.6 * AXIS_LEN, LANDFALL_S);
  if (s > LANDFALL_S) peak *= Math.exp(-(s - LANDFALL_S) / 300);
  // narrower, sharper poleward (cold-front) flank; broader equatorward flank; widens toward its source
  const w = 1 + 0.6 * (1 - smooth(s, 0, 0.5 * AXIS_LEN));
  const sig = (side < 0 ? 190 : 290) * w;
  let v = peak * Math.exp(-(d * d) / (2 * sig * sig));
  if (s <= 1) v *= Math.exp(-a.d / 700); // fade beyond the upstream end
  // embedded moisture maxima along the stream
  v *= 1 + 0.1 * noise(s / 111, 0, 6, 3);
  // moisture wrapping into the parent cyclone, poleward of landfall
  const cyc = 290 * Math.exp(-(((lon + 131) / 7) ** 2) - (((lat - 41.5) / 4) ** 2));
  // tropical reservoir (trade-wind / ITCZ belt), patchy
  const trop = 225 * Math.exp(-(((lat - 9) / 6.5) ** 2)) * (1 + 0.25 * fbm(lon, lat, 6, 5));
  const eddy = 45 * fbm(lon, lat, 4, 9) * smooth(lat, 12, 28);
  return Math.max(0, v + cyc * (1 + 0.3 * fbm(lon, lat, 3, 11)) + trop + eddy);
}

// NA west-coast longitude by latitude (for the coastal warm band of the positive PDO)
const COAST = [[10, -93], [18, -106], [23, -111], [28, -115.5], [32, -117.5], [35, -121], [40, -124.5], [45, -124.2], [50, -127.5], [55, -133], [58, -138], [60, -146], [62, -152]];
const coastLon = (lat) => {
  if (lat <= COAST[0][0]) return COAST[0][1];
  for (let i = 1; i < COAST.length; i++) if (lat <= COAST[i][0]) {
    const [a, b] = [COAST[i - 1], COAST[i]]; return a[1] + ((lat - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
  }
  return COAST[COAST.length - 1][1];
};
// SST anomaly, °C: El Niño warm tongue + positive-PDO horseshoe (warm coast, cool central N Pacific)
function ssta(lon, lat) {
  const nino = 1.9 * Math.exp(-(((lat + 0.5) / 6.5) ** 2)) * Math.exp(-(((lon + 128) / 26) ** 2)) * smooth(lon, -205, -175);
  const coast = 1.05 * Math.exp(-(((lon - coastLon(lat)) / 9) ** 2)) * smooth(lat, 8, 16) * (1 - smooth(lat, 58, 64));
  const cool = -1.15 * Math.exp(-(((lon + 168) / 21) ** 2) - (((lat - 40) / 7.5) ** 2));
  const edd = 0.12 * Math.sin(lon / 6.1 - lat / 4.3) * Math.sin(lat / 5.7);
  return nino + coast + cool + edd;
}

// grid (lon −205…−95, lat −16…68, 0.5°)
const G = { lon0: -205, lat0: -16, d: 0.5, nx: 221, ny: 169 };
const sample = (fn) => {
  const v = new Float64Array(G.nx * G.ny);
  for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) v[j * G.nx + i] = fn(G.lon0 + i * G.d, G.lat0 + j * G.d);
  return v;
};
const IVT = sample(ivt);
const SST = sample(ssta);
const SSTneg = SST.map((x) => -x);
const cIVT = contours().size([G.nx, G.ny]).thresholds([250, 500, 750])(IVT);
const cWarm = contours().size([G.nx, G.ny]).thresholds([0.5, 1.0, 1.5])(SST);
const cCool = contours().size([G.nx, G.ny]).thresholds([0.5, 1.0])(SSTneg);

// ───────────────────────────── drawing helpers ─────────────────────────────
const f1 = (x) => Math.round(x * 10) / 10;

// drop projected points closer than `tol` px to the previous kept one (keeps files small)
function thinStream(tol) {
  return (out) => {
    let last = null, pending = null, inLine = false;
    return {
      point(x, y) {
        if (!inLine || !last) { out.point(x, y); last = [x, y]; pending = null; return; }
        if (Math.hypot(x - last[0], y - last[1]) >= tol) { out.point(x, y); last = [x, y]; pending = null; } else pending = [x, y];
      },
      lineStart() { inLine = true; last = null; pending = null; out.lineStart(); },
      lineEnd() { if (pending) out.point(pending[0], pending[1]); inLine = false; out.lineEnd(); },
      polygonStart() { out.polygonStart(); },
      polygonEnd() { out.polygonEnd(); },
      sphere() { out.sphere?.(); },
    };
  };
}

function makeMap(cfg) {
  // Mercator (conformal: coastline shapes are true; parallels and meridians stay straight,
  // as in most reanalysis composite maps). Latitude range [latS, latN] fills the frame height.
  const { W, H, lon0, latS, latN } = cfg;
  const merc = (la) => Math.log(Math.tan(Math.PI / 4 + (la * D2R) / 2));
  const k = H / (merc(latN) - merc(latS));
  const proj = geoMercator().rotate([-lon0, 0]).scale(k).translate([W / 2, k * merc(latN)]).precision(0.2);
  proj.clipExtent([[-2, -2], [W + 2, H + 2]]);
  const thin = thinStream(cfg.tol ?? 0.7);
  const path = geoPath({ stream: (s) => proj.stream(thin(s)) }).digits(1);
  const P = (lon, lat) => proj([lon, lat]);
  // contour MultiPolygons live in grid space; project them planar (no spherical winding)
  const gridPath = (mp) => {
    let d = '';
    for (const poly of mp.coordinates) for (const ring of poly) {
      let last = null;
      ring.forEach(([gx, gy], k) => {
        const [x, y] = P(G.lon0 + gx * G.d, G.lat0 + gy * G.d);
        if (k && last && Math.hypot(x - last[0], y - last[1]) < (cfg.tol ?? 0.7) && k < ring.length - 1) return;
        d += (k ? 'L' : 'M') + f1(x) + ',' + f1(y);
        last = [x, y];
      });
      d += 'Z';
    }
    return d;
  };
  const line = (pts) => pts.map((p, k) => { const [x, y] = P(p[0], p[1]); return (k ? 'L' : 'M') + f1(x) + ',' + f1(y); }).join('');
  return { proj, path, P, gridPath, line };
}

const CSS = (p, fs) => `
.${p}{--${p}-ink:var(--color-text,#1b2a33);--${p}-surf:var(--color-surface,#fff);--${p}-acc:var(--color-accent,#0f6e56);--${p}-acc2:var(--color-accent-2,#1d9e75);--${p}-warm:var(--color-warm,#ba7517);--${p}-warmt:var(--color-warm-text,#8a5510);--${p}-muted:var(--color-text-muted,#45565f);--${p}-faint:var(--color-text-faint,#5d6d76)}
.${p}-sea{fill:var(--${p}-surf)}
.${p}-land{fill:color-mix(in srgb,var(--${p}-ink) 9%,var(--${p}-surf))}
.${p}-ca{fill:color-mix(in srgb,var(--${p}-ink) 19%,var(--${p}-surf))}
.${p}-coast{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 52%,var(--${p}-surf));stroke-width:.7;stroke-linejoin:round}
.${p}-ctry{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 45%,var(--${p}-surf));stroke-width:.6;stroke-linejoin:round}
.${p}-st{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 28%,var(--${p}-surf));stroke-width:.45;stroke-linejoin:round}
.${p}-caedge{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 70%,var(--${p}-surf));stroke-width:1.1;stroke-linejoin:round}
.${p}-grat{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 13%,var(--${p}-surf));stroke-width:.6}
.${p}-frame{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 40%,var(--${p}-surf));stroke-width:.8}
.${p}-i1{fill:color-mix(in srgb,var(--${p}-acc) 20%,var(--${p}-surf));opacity:.94}
.${p}-i2{fill:color-mix(in srgb,var(--${p}-acc) 44%,var(--${p}-surf));opacity:.96}
.${p}-i3{fill:color-mix(in srgb,var(--${p}-acc) 74%,var(--${p}-surf))}
.${p}-iedge{fill:none;stroke:color-mix(in srgb,var(--${p}-acc) 85%,var(--${p}-surf));stroke-width:.5;stroke-opacity:.7}
.${p}-flow{fill:none;stroke:var(--${p}-surf);stroke-width:1.1;stroke-linecap:round;stroke-opacity:.85}
.${p}-flowh{fill:var(--${p}-surf);fill-opacity:.9}
.${p}-w1{fill:var(--${p}-warm);fill-opacity:.05}
.${p}-w2{fill:var(--${p}-warm);fill-opacity:.05}
.${p}-w3{fill:var(--${p}-warm);fill-opacity:.05}
.${p}-wl{fill:none;stroke:var(--${p}-warm);stroke-width:.8;stroke-opacity:.85}
.${p}-cl{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 60%,var(--${p}-surf));stroke-width:.8;stroke-dasharray:3 2.5}
.${p}-ch{fill:url(#${p}-hatch)}
.${p}-hl{stroke:color-mix(in srgb,var(--${p}-ink) 30%,var(--${p}-surf));stroke-width:.7}
.${p}-nino{fill:none;stroke:var(--${p}-warmt);stroke-width:1.2}
.${p}-dot{fill:var(--${p}-surf);stroke:var(--${p}-ink);stroke-width:1.6}
.${p}-lead{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 60%,var(--${p}-surf));stroke-width:.8}
.${p}-t{font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:${fs}px;font-weight:500;fill:var(--${p}-muted);paint-order:stroke;stroke:var(--${p}-surf);stroke-width:3px;stroke-linejoin:round}
.${p}-b{font-weight:650;fill:var(--${p}-ink)}
.${p}-ar{font-weight:650;fill:var(--${p}-acc);letter-spacing:.01em}
.${p}-wt{fill:var(--${p}-warmt);font-weight:600}
.${p}-g{font-size:${fs - 1}px;font-weight:450;fill:var(--${p}-faint);stroke:none}
.${p}-oc{font-style:italic;font-weight:450;letter-spacing:.3em;fill:var(--${p}-faint);stroke:none}
.${p}-nh{stroke:none}
.${p}{--${p}-q:color-mix(in srgb,var(--${p}-ink) 75%,transparent);--${p}-q3:var(--${p}-q)}
@media (prefers-color-scheme:dark){:root:not([data-theme='light']) .${p}{--${p}-q3:#0e181e}}
:root[data-theme='dark'] .${p}{--${p}-q3:#0e181e}
.${p}-q{fill:none;stroke:var(--${p}-q);stroke-width:.85;stroke-linecap:round}.${p}-qh{fill:var(--${p}-q)}
.${p}-q3{fill:none;stroke:var(--${p}-q3);stroke-width:.85;stroke-linecap:round}.${p}-q3h{fill:var(--${p}-q3)}
.${p}-key{stroke:color-mix(in srgb,var(--${p}-ink) 45%,var(--${p}-surf));stroke-width:.6}
`;

function drawMap(cfg) {
  const { W, p } = cfg;
  const H = cfg.mapH ?? cfg.H;
  const m = makeMap({ ...cfg, H });
  const { path, P, gridPath, line, proj } = m;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${cfg.H}" class="${p}">\n<style>${CSS(p, cfg.fs ?? 12)}${cfg.css ?? ''}</style>\n`;
  s += `<defs><clipPath id="${p}-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>`;
  s += `<pattern id="${p}-hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="${p}-hl" x1="0" y1="0" x2="0" y2="4.5"/></pattern></defs>\n`;
  s += `<g clip-path="url(#${p}-clip)">\n<rect class="${p}-sea" width="${W}" height="${H}"/>\n`;
  // geometry used twice (fill + outline) is defined once and drawn with <use>
  let defs = '';
  const def = (id, d) => { defs += `<path id="${p}-${id}" d="${d}"/>`; return `#${p}-${id}`; };
  const use = (href, cls) => `<use href="${href}" class="${p}-${cls}"/>`;
  let body = '';
  // SST anomalies (under the land, which masks them)
  if (cfg.sst !== false) {
    const wr = cWarm.map((c, k) => (c.coordinates.length ? def('w' + k, gridPath(c)) : null));
    const cr = cCool.map((c, k) => (c.coordinates.length ? def('c' + k, gridPath(c)) : null));
    wr.forEach((h, k) => { if (h) body += use(h, 'w' + (k + 1)); });
    if (cr[0]) body += use(cr[0], 'ch');
    wr.forEach((h) => { if (h) body += use(h, 'wl'); });
    cr.forEach((h) => { if (h) body += use(h, 'cl'); });
    body += '\n';
  }
  // graticule (straight lines in Mercator)
  let g = '';
  for (let lo = -230; lo <= -60; lo += 10) { const x = P(lo, 0)[0]; if (x > 0 && x < W) g += `M${f1(x)},0V${H}`; }
  for (let la = -20; la <= 80; la += 10) { const y = P(cfg.lon0, la)[1]; if (y > 0 && y < H) g += `M0,${f1(y)}H${W}`; }
  body += `<path class="${p}-grat" d="${g}"/>\n`;
  // land
  const LAND = def('land', path(land)), CA = def('ca', path(california));
  body += use(LAND, 'land') + use(CA, 'ca') + '\n';
  // IVT (above land: the river crosses the coast)
  const ir = cIVT.map((c, k) => (c.coordinates.length ? def('i' + k, gridPath(c)) : null));
  ir.forEach((h, k) => { if (h) body += use(h, 'i' + (k + 1)); });
  if (cfg.iedge !== false) ir.forEach((h) => { if (h) body += use(h, 'iedge'); });
  // borders and coast on top
  body += `\n<path class="${p}-st" d="${path(stateLines)}"/>\n<path class="${p}-ctry" d="${path(borders)}"/>\n`;
  body += use(LAND, 'coast') + use(CA, 'caedge') + '\n';
  s += `<defs>${defs}</defs>\n` + body;
  // IVT vectors on a regular screen grid (direction: local flow along the river), length ∝ IVT
  if (cfg.quiver !== false) {
    const sp = cfg.qsp ?? 19, Lmax = cfg.qlen ?? 17, hw = cfg.qhead ?? 2.6;
    const out = { q: ['', ''], q3: ['', ''] };
    for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2 + ((Math.round(y / sp) % 2) * sp) / 2; x < W; x += sp) {
      const [lon, lat] = proj.invert([x, y]);
      const v = ivt(lon, lat);
      if (v < 250) continue;
      const a = axisCoords(lon, lat);
      if (a.d > 900 || a.s > LANDFALL_S + 150) continue;
      const i = Math.min(AXIS.length - 2, a.i);
      const [x1, y1] = P(...AXIS[i]), [x2, y2] = P(...AXIS[i + 1]);
      const n = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / n, uy = (y2 - y1) / n;
      const L = Math.max(6, (Math.min(v, 1000) / 1000) * Lmax);
      const x0 = x - (ux * L) / 2, y0 = y - (uy * L) / 2, xe = x + (ux * L) / 2, ye = y + (uy * L) / 2;
      const k = v >= 750 ? 'q3' : 'q';
      out[k][0] += `M${f1(x0)},${f1(y0)}L${f1(xe - ux * hw)},${f1(ye - uy * hw)}`;
      const bx = xe - ux * hw * 1.9, by = ye - uy * hw * 1.9;
      out[k][1] += `M${f1(xe)},${f1(ye)}L${f1(bx - uy * hw)},${f1(by + ux * hw)}L${f1(bx + uy * hw)},${f1(by - ux * hw)}Z`;
    }
    for (const k of ['q', 'q3']) if (out[k][0]) s += `<path class="${p}-${k}" d="${out[k][0]}"/><path class="${p}-${k}h" d="${out[k][1]}"/>\n`;
  }
  // Niño 3.4 box
  if (cfg.nino !== false) {
    const r = [];
    for (let lo = -170; lo <= -120; lo += 1) r.push([lo, 5]);
    for (let lo = -120; lo >= -170; lo -= 1) r.push([lo, -5]);
    s += `<path class="${p}-nino" d="${line(r)}Z"/>\n`;
  }
  s += `</g>\n<rect class="${p}-frame" x=".4" y=".4" width="${W - 0.8}" height="${H - 0.8}"/>\n`;
  return { s, m: { ...m, H } };
}

// graticule labels just inside the frame edges
function edgeLabels(m, cfg, lats, lons) {
  const { P, H } = m, { W, p } = cfg;
  let s = '';
  for (const la of lats) {
    const y = P(cfg.lon0, la)[1];
    if (y > 12 && y < H - 16) s += `<text class="${p}-t ${p}-g" x="5" y="${f1(y - 3)}">${la === 0 ? '0°' : la + '°N'}</text>`;
  }
  for (const lo of lons) {
    const x = P(lo, 0)[0];
    if (x > 14 && x < W - 30) s += `<text class="${p}-t ${p}-g" x="${f1(x + 3)}" y="${H - 5}">${lo === -180 ? '180°' : -lo + '°W'}</text>`;
  }
  return s + '\n';
}

const txt = (m, cfg, t, lon, lat, cls = '', anchor = 'start', dx = 0, dy = 0, rot = 0) => {
  const [x, y] = m.P(lon, lat);
  const X = f1(x + dx), Y = f1(y + dy);
  return `<text class="${cfg.p}-t ${cls}" x="${X}" y="${Y}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}${rot ? ` transform="rotate(${f1(rot)} ${X} ${Y})"` : ''}>${t}</text>`;
};
// screen angle of the AR axis at an along-axis fraction, and a point offset `off` px to its left (poleward)
const axisLabel = (m, frac, off) => {
  const i = AXIS_S.findIndex((v) => v >= frac * AXIS_LEN);
  const [x1, y1] = m.P(...AXIS[i - 3]), [x2, y2] = m.P(...AXIS[i + 3]), [x, y] = m.P(...AXIS[i]);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return { ang: (a * 180) / Math.PI, x: x + Math.sin(a) * off, y: y - Math.cos(a) * off };
};
const rtxt = (cfg, t, x, y, ang, cls) =>
  `<text class="${cfg.p}-t ${cls}" x="${f1(x)}" y="${f1(y)}" text-anchor="middle" transform="rotate(${f1(ang)} ${f1(x)} ${f1(y)})">${t}</text>`;

// legend blocks (each returns svg; x,y = top-left of the block's title baseline)
const sub = (p, t) => `<tspan class="${p}-nh" style="font-weight:450">${t}</tspan>`;
function legIVT(cfg, x, y, sw = 38) {
  const { p } = cfg, fs = cfg.fs ?? 12;
  let s = `<g transform="translate(${x} ${y})"><text class="${p}-t ${p}-b ${p}-nh" x="0" y="0">IVT ${sub(p, '(kg m⁻¹ s⁻¹)')}</text>`;
  ['i1', 'i2', 'i3'].forEach((c, k) => { s += `<rect class="${p}-${c} ${p}-key" x="${k * sw}" y="7" width="${sw}" height="9"/>`; });
    ['250', '500', '750'].forEach((t, k) => { s += `<text class="${p}-t ${p}-g" x="${k * sw}" y="${16 + fs + 2}"${k ? ' text-anchor="middle"' : ''}>${t}</text>`; });
  return s + '</g>';
}
function legSST(cfg, x, y, unit = '(0.5 °C contours)') {
  const { p } = cfg, fs = cfg.fs ?? 12;
  let s = `<g transform="translate(${x} ${y})"><text class="${p}-t ${p}-b ${p}-nh" x="0" y="0">SST anomaly ${sub(p, unit)}</text>`;
  s += `<path class="${p}-wl" d="M0,${fs + 2}h22"/><text class="${p}-t ${p}-nh" x="28" y="${fs + 6}">warm</text>`;
  s += `<rect class="${p}-ch ${p}-key" x="80" y="${fs - 3}" width="22" height="10" style="stroke:none"/><path class="${p}-cl" d="M80,${fs + 2}h22"/><text class="${p}-t ${p}-nh" x="108" y="${fs + 6}">cool</text>`;
  return s + '</g>';
}
function legModes(cfg, x, y) {
  const { p } = cfg, fs = cfg.fs ?? 12;
  let s = `<g transform="translate(${x} ${y})"><text class="${p}-t ${p}-b ${p}-nh" x="0" y="0">Climate modes</text>`;
  s += `<rect class="${p}-nino" x=".6" y="${fs - 3}" width="22" height="10"/><text class="${p}-t ${p}-nh" x="28" y="${fs + 6}">Niño 3.4 region (ENSO)</text>`;
  return s + '</g>';
}

// ───────────────────────────── wide (theme page) ─────────────────────────────
{
  const cfg = { p: 'ar', W: 720, H: 500, mapH: 446, lon0: -151, latS: -8, latN: 56, fs: 12 };
  const { s: base, m } = drawMap(cfg);
  let s = base;
  s += edgeLabels(m, cfg, [0, 20, 40], [-180, -160, -140, -120]);
  s += txt(m, cfg, 'PACIFIC OCEAN', -128, 15, `${cfg.p}-oc`, 'middle');
  const L = axisLabel(m, 0.47, 30);
  s += rtxt(cfg, 'Atmospheric river', L.x, L.y, L.ang, `${cfg.p}-ar`);
  // Hawaiʻi: label south of the islands with a short leader
  const [hx, hy] = m.P(-157.3, 19.6), [hx2, hy2] = m.P(-151, 12.2);
  s += `<path class="${cfg.p}-lead" d="M${f1(hx + 2)},${f1(hy + 2)}L${f1(hx2)},${f1(hy2)}"/>` + `<text class="${cfg.p}-t" x="${f1(hx2 + 3)}" y="${f1(hy2 + 10)}">Hawaiʻi</text>`;
  s += txt(m, cfg, 'California', -117.2, 34.6, `${cfg.p}-b`, 'start', 0, 0);
  // landfall marker + leader into Nevada/Utah
  const [lx, ly] = m.P(-123.1, 38.3), [tx, ty] = m.P(-112, 45.5);
  s += `<path class="${cfg.p}-lead" d="M${f1(lx + 3)},${f1(ly - 3)}L${f1(tx - 3)},${f1(ty + 4)}"/><circle class="${cfg.p}-dot" cx="${f1(lx)}" cy="${f1(ly)}" r="3.6"/>`;
  s += `<text class="${cfg.p}-t" x="${f1(tx)}" y="${f1(ty - 7)}"><tspan class="${cfg.p}-b">Landfall</tspan><tspan x="${f1(tx)}" dy="15">extreme precipitation</tspan></text>`;
  // climate modes
  s += txt(m, cfg, 'ENSO · Niño 3.4', -145, 5, `${cfg.p}-wt`, 'middle', 0, -7);
  s += txt(m, cfg, 'PDO, positive phase', -170, 40, `${cfg.p}-b`, 'middle', 0, 0);
  s += txt(m, cfg, 'cool central North Pacific', -170, 40, '', 'middle', 0, 15);
  s += txt(m, cfg, 'warm coastal waters', -132, 51, `${cfg.p}-wt`, 'end', 0, 0);
  // legend strip below the map
  const ly0 = m.H + 20;
  s += legIVT(cfg, 2, ly0) + legSST(cfg, 250, ly0) + legModes(cfg, 470, ly0) + '\n';
  writeFileSync(OUT + 'climate-extremes.svg', s + '</svg>\n');
  console.log('wide', Buffer.byteLength(s));
}

// ───────────────────────────── narrow (phones) ─────────────────────────────
{
  const cfg = { p: 'arn', W: 400, H: 546, mapH: 440, lon0: -140.8, latS: -7, latN: 51, fs: 13, tol: 0.6, qsp: 17, qlen: 14, qhead: 2.3 };
  const { s: base, m } = drawMap(cfg);
  let s = base;
  s += edgeLabels(m, cfg, [0, 20, 40], [-160, -140, -120]);
  const L = axisLabel(m, 0.5, 26);
  s += rtxt(cfg, 'Atmospheric river', L.x, L.y, L.ang, `${cfg.p}-ar`);
  s += txt(m, cfg, 'California', -120.2, 35.6, `${cfg.p}-b`, 'start', 0, 5);
  const [lx, ly] = m.P(-123.1, 38.3);
  s += `<circle class="${cfg.p}-dot" cx="${f1(lx)}" cy="${f1(ly)}" r="3.4"/>`;
  s += txt(m, cfg, 'Landfall', -123.1, 38.3, `${cfg.p}-b`, 'start', 7, -8);
  s += txt(m, cfg, 'Niño 3.4', -145, 5, `${cfg.p}-wt`, 'middle', 0, -7);
  s += txt(m, cfg, 'PDO', -161, 43.5, `${cfg.p}-b`, 'middle', 0, 5);
  const ly0 = m.H + 22;
  s += legIVT(cfg, 2, ly0, 40) + legSST(cfg, 2, ly0 + 50, '(0.5 °C)') + legModes(cfg, 200, ly0 + 50) + '\n';
  writeFileSync(OUT + 'climate-extremes.narrow.svg', s + '</svg>\n');
  console.log('narrow', Buffer.byteLength(s));
}

// ───────────────────────────── card thumbnail (no text) ─────────────────────────────
{
  const cfg = { p: 'arc', W: 640, H: 340, lon0: -139, latS: 11, latN: 49, tol: 0.9, qsp: 22, qlen: 19, qhead: 3 };
  cfg.css = `.arc-coast{stroke-width:.9}.arc-caedge{stroke-width:1.4}.arc-frame{display:none}.arc-sea{fill:none}.arc-q,.arc-q3{stroke-width:1.1}`;
  const { s } = drawMap(cfg);
  writeFileSync(OUT + 'climate-extremes-card.svg', s + '</svg>\n');
  console.log('card', Buffer.byteLength(s));
}
