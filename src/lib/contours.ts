/**
 * Generates topographic contour lines (isolines) from a synthetic terrain.
 * Pure TypeScript, runs at build time: marching squares → chained polylines →
 * Douglas–Peucker simplification → smoothed quadratic Bézier SVG paths.
 * Deterministic (seeded), so the motif never changes between builds.
 */

export type Field = (x: number, y: number) => number;

export interface ContourOptions {
  width: number;
  height: number;
  /** Grid cell size in px (smaller = smoother but bigger output). */
  cell: number;
  field: Field;
  /** Number of contour levels between the field min and max. */
  levels: number;
  /** Every n-th level is an "index contour" (drawn thicker). 0 = none. */
  indexEvery?: number;
  /** Skip this many of the lowest levels (flat valleys look noisy). */
  skipLow?: number;
  /** Space levels by area (quantiles) instead of height — gives an even line density. */
  quantile?: boolean;
  /** Explicit iso-values (overrides `levels`/`quantile`). */
  thresholds?: number[];
}

export interface ContourPath {
  d: string;
  level: number;
  index: boolean;
}

type Pt = [number, number];

/** Small seeded PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 2D value noise in [-1, 1]. */
export function valueNoise(seed: number) {
  const r = rng(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [perm[i], perm[j]] = [perm[j]!, perm[i]!];
  }
  const vals = Array.from({ length: 256 }, () => r() * 2 - 1);
  const h = (i: number, j: number) => vals[perm[(perm[i & 255]! + j) & 255]!]!;
  const s = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = s(x - xi);
    const fy = s(y - yi);
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * fx;
    const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * fx;
    return a + (b - a) * fy;
  };
}

/** A terrain made of Gaussian hills/basins plus soft ridging waves. */
export function terrain(seed: number, width: number, height: number, hills = 9, roughness = 0.35): Field {
  const r = rng(seed);
  const bumps = Array.from({ length: hills }, () => ({
    x: r() * width,
    y: r() * height,
    sx: (0.08 + r() * 0.22) * width,
    sy: (0.15 + r() * 0.35) * height,
    a: (r() < 0.75 ? 1 : -0.7) * (0.5 + r()),
    rot: r() * Math.PI,
  }));
  const noise = valueNoise(Math.floor(r() * 1e9));
  const k1 = 2 + r() * 2;
  const k2 = 1.5 + r() * 2;
  const ph = r() * Math.PI * 2;
  return (x, y) => {
    let v = 0;
    for (const b of bumps) {
      const dx = x - b.x;
      const dy = y - b.y;
      const c = Math.cos(b.rot);
      const s = Math.sin(b.rot);
      const u = (dx * c + dy * s) / b.sx;
      const w = (-dx * s + dy * c) / b.sy;
      v += b.a * Math.exp(-(u * u + w * w) / 2);
    }
    v += 0.12 * Math.sin((x / width) * Math.PI * k1 + ph) * Math.cos((y / height) * Math.PI * k2);
    // fBm noise gives the lines a natural, hand-surveyed wobble.
    const n = 1 / Math.min(width, height);
    v += roughness * (noise(x * n * 2.2, y * n * 2.2) + 0.5 * noise(x * n * 4.5, y * n * 4.5) + 0.25 * noise(x * n * 9, y * n * 9));
    return v;
  };
}

function simplify(points: Pt[], eps: number): Pt[] {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [x1, y1] = points[s]!;
    const [x2, y2] = points[e]!;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let maxD = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const [px, py] = points[i]!;
      const d = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1) / len;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

/** Smooth polyline → path using quadratic curves through segment midpoints. */
function toPath(pts: Pt[], closed: boolean): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${f1(pts[0]![0])} ${f1(pts[0]![1])}L${f1(pts[1]![0])} ${f1(pts[1]![1])}`;
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = '';
  if (closed) {
    const n = pts.length;
    const start = mid(pts[n - 1]!, pts[0]!);
    d = `M${f1(start[0])} ${f1(start[1])}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i]!;
      const m = mid(p, pts[(i + 1) % n]!);
      d += `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
    }
    return `${d}Z`;
  }
  d = `M${f1(pts[0]![0])} ${f1(pts[0]![1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const m = mid(p, pts[i + 1]!);
    d += `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  const last = pts[pts.length - 1]!;
  return `${d}L${f1(last[0])} ${f1(last[1])}`;
}

export function contours(o: ContourOptions): ContourPath[] {
  const cols = Math.ceil(o.width / o.cell) + 1;
  const rows = Math.ceil(o.height / o.cell) + 1;
  const g = new Float64Array(cols * rows);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const v = o.field(i * o.cell, j * o.cell);
      g[j * cols + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const at = (i: number, j: number) => g[j * cols + i]!;
  const out: ContourPath[] = [];
  const step = (max - min) / (o.levels + 1);
  // Optionally place levels at quantiles so lines are spread evenly across the canvas.
  const sorted = o.quantile ? Array.from(g).sort((a, b) => a - b) : null;
  const levelValue = (L: number) =>
    sorted ? sorted[Math.floor((L / (o.levels + 1)) * (sorted.length - 1))]! : min + step * L;

  const list: [number, number][] = o.thresholds
    ? o.thresholds.map((t, i) => [i + 1, t])
    : Array.from({ length: Math.max(0, o.levels - (o.skipLow ?? 0)) }, (_, i) => {
        const L = i + 1 + (o.skipLow ?? 0);
        return [L, levelValue(L)];
      });
  for (const [L, t] of list) {
    // Edge keys: horizontal edge (i,j)-(i+1,j) = "h,i,j"; vertical (i,j)-(i,j+1) = "v,i,j"
    const pos = new Map<string, Pt>();
    const adj = new Map<string, string[]>();
    const point = (key: string): Pt => {
      let p = pos.get(key);
      if (p) return p;
      const [kind, si, sj] = key.split(',');
      const i = Number(si);
      const j = Number(sj);
      const a = at(i, j);
      const b = kind === 'h' ? at(i + 1, j) : at(i, j + 1);
      const f = (t - a) / (b - a || 1e-12);
      p = kind === 'h' ? [(i + f) * o.cell, j * o.cell] : [i * o.cell, (j + f) * o.cell];
      pos.set(key, p);
      return p;
    };
    const link = (k1: string, k2: string) => {
      point(k1);
      point(k2);
      (adj.get(k1) ?? adj.set(k1, []).get(k1)!).push(k2);
      (adj.get(k2) ?? adj.set(k2, []).get(k2)!).push(k1);
    };

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const tl = at(i, j) > t ? 8 : 0;
        const tr = at(i + 1, j) > t ? 4 : 0;
        const br = at(i + 1, j + 1) > t ? 2 : 0;
        const bl = at(i, j + 1) > t ? 1 : 0;
        const c = tl | tr | br | bl;
        if (c === 0 || c === 15) continue;
        const top = `h,${i},${j}`;
        const bottom = `h,${i},${j + 1}`;
        const left = `v,${i},${j}`;
        const right = `v,${i + 1},${j}`;
        const centre = (at(i, j) + at(i + 1, j) + at(i + 1, j + 1) + at(i, j + 1)) / 4 > t;
        switch (c) {
          case 1: case 14: link(left, bottom); break;
          case 2: case 13: link(bottom, right); break;
          case 3: case 12: link(left, right); break;
          case 4: case 11: link(top, right); break;
          case 6: case 9: link(top, bottom); break;
          case 7: case 8: link(left, top); break;
          case 5:
            if (centre) { link(left, top); link(bottom, right); } else { link(left, bottom); link(top, right); }
            break;
          case 10:
            if (centre) { link(left, bottom); link(top, right); } else { link(left, top); link(bottom, right); }
            break;
        }
      }
    }

    // Chain segments into polylines.
    const visited = new Set<string>();
    const edgeId = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
    const walk = (start: string): { keys: string[]; closed: boolean } => {
      const keys = [start];
      let prev = '';
      let cur = start;
      for (;;) {
        const next = (adj.get(cur) ?? []).find((n) => n !== prev && !visited.has(edgeId(cur, n)));
        if (!next) break;
        visited.add(edgeId(cur, next));
        if (next === start) return { keys, closed: true };
        keys.push(next);
        prev = cur;
        cur = next;
      }
      return { keys, closed: false };
    };
    const chains: { keys: string[]; closed: boolean }[] = [];
    // Open chains start at endpoints (degree 1) so they are walked end to end.
    for (const [k, n] of adj) if (n.length === 1 && !visited.has(edgeId(k, n[0]!))) chains.push(walk(k));
    for (const [k, n] of adj) for (const m of n) if (!visited.has(edgeId(k, m))) chains.push(walk(k));

    for (const ch of chains) {
      if (ch.keys.length < 4) continue; // drop specks
      const pts = simplify(ch.keys.map((k) => pos.get(k)!), o.cell * 0.12);
      const d = toPath(pts, ch.closed);
      if (d) out.push({ d, level: L, index: !!o.indexEvery && L % o.indexEvery === 0 });
    }
  }
  return out;
}

/** A complete standalone SVG string (black strokes — meant for CSS masks or currentColor). */
export function contourSvg(
  o: ContourOptions & { stroke?: number; indexStroke?: number; color?: string },
): string {
  const paths = contours(o);
  const color = o.color ?? '#000';
  const minor = paths.filter((p) => !p.index).map((p) => p.d).join('');
  const major = paths.filter((p) => p.index).map((p) => p.d).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.width} ${o.height}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path stroke-width="${o.stroke ?? 1}" d="${minor}"/>` +
    (major ? `<path stroke-width="${o.indexStroke ?? 1.8}" d="${major}"/>` : '') +
    `</svg>`
  );
}
