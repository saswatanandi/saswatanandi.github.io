/**
 * "Hydrograph ridgelines" — the site's signature motif.
 *
 * A stack of storm hydrographs drawn back to front, each one filled with the
 * page background so it hides the lines behind it (Joy-Division style). Every
 * storm is a gamma-shaped unit hydrograph: a steep rising limb and a long
 * recession. Storm timing drifts a little from line to line so the stack reads
 * as one landscape.
 *
 * Pure TypeScript with no imports (so scripts/ can run it directly with Node),
 * deterministic (seeded) and theme-aware: colours are CSS custom properties.
 */

type Pt = [number, number];

interface Storm {
  /** time of the peak, in viewBox x units */
  t: number;
  /** relative peak height (0–1) */
  a: number;
  /** time scale (width of the event), in x units */
  w: number;
}

export interface RidgeOptions {
  width: number;
  /** number of lines in the stack */
  lines: number;
  /** vertical distance between baselines */
  spacing: number;
  /** tallest peak, in y units */
  amplitude: number;
  storms: Storm[];
  /** storms are muted before envelope[0] and full size after envelope[1] */
  envelope: [number, number];
  /** the whole stack fades in from the left over this x range */
  fade?: [number, number];
  /** gap below the front line */
  bottom?: number;
  /** sampling step along x */
  step?: number;
  /** muted-storm size on the flat (left) side, 0–1 */
  floor?: number;
  seed?: number;
  /** unique prefix for the <mask> id (several motifs can share a page) */
  id: string;
  /** line opacity multipliers */
  frontOpacity?: number;
  backOpacity?: number;
  /** stroke widths */
  frontWidth?: number;
  backWidth?: number;
  class?: string;
  /** horizontal anchor when the viewport is narrower than the viewBox */
  align?: 'xMin' | 'xMid' | 'xMax';
}

/** mulberry32 — tiny seeded PRNG in [0, 1). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ramer–Douglas–Peucker: drops points on the long flat stretches. */
function simplify(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [x1, y1] = pts[s]!;
    const [x2, y2] = pts[e]!;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const [x, y] = pts[i]!;
      const d = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const num = (v: number) => {
  const s = v.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** gamma-shaped unit hydrograph, peak = 1 at t = k */
const uh = (t: number, k: number) => (t <= 0 ? 0 : Math.pow(t / k, k) * Math.exp(k - t));

/** Height of the viewBox needed for a given option set. */
export function ridgeHeight(o: Pick<RidgeOptions, 'lines' | 'spacing' | 'amplitude' | 'bottom'>): number {
  return Math.ceil((o.bottom ?? 14) + (o.lines - 1) * o.spacing + o.amplitude * 1.1 + 6);
}

export function ridgelinesSvg(o: RidgeOptions): string {
  const W = o.width;
  const H = ridgeHeight(o);
  const L = o.lines;
  const bottom = o.bottom ?? 14;
  const step = o.step ?? 5;
  const floor = o.floor ?? 0.1;
  const r = rng(o.seed ?? 5);

  let paths = '';
  for (let li = 0; li < L; li++) {
    const depth = L === 1 ? 1 : li / (L - 1); // 0 = back, 1 = front
    const base = H - bottom - (L - 1 - li) * o.spacing;
    const events = o.storms.map((s, si) => ({
      t: s.t + (r() - 0.5) * s.w * 2.2 + li * s.w * 0.16,
      a: s.a * (0.35 + 0.65 * r()) * (0.3 + 0.7 * Math.sin(li * 0.3 + si * 1.9) ** 2),
      w: s.w * (0.75 + 0.5 * r()),
      k: 1.15 + r() * 0.5, // small k = flashy rise
    }));
    const pts: Pt[] = [];
    for (let x = -step; x <= W + step; x += step) {
      let q = 0;
      for (const e of events) q += e.a * uh((x - e.t) / e.w + e.k, e.k);
      q += 0.015 * Math.sin(x / 41 + li * 1.3) + 0.01 * Math.sin(x / 17 + li * 2.3); // baseflow ripple
      const amp = o.amplitude * (floor + (1 - floor) * smoothstep(o.envelope[0], o.envelope[1], x));
      pts.push([x, base - Math.min(q, 1.1) * amp]);
    }
    const d = simplify(pts, 0.3)
      .map((p, i) => `${i ? 'L' : 'M'}${num(p[0])} ${num(p[1])}`)
      .join('');
    const front = li === L - 1;
    const opacity = front
      ? `var(--ridge-front, ${o.frontOpacity ?? 0.85})`
      : `calc(var(--ridge-back, ${o.backOpacity ?? 0.4}) * ${(0.3 + 0.7 * depth).toFixed(2)})`;
    // The fill closes far below the viewBox, so its closing edges are never stroked on screen.
    paths +=
      `<path d="${d}V${H + 24}H${-step}Z" fill="var(--color-bg)" stroke="${front ? 'var(--color-accent)' : 'currentColor'}"` +
      ` stroke-width="${front ? (o.frontWidth ?? 1.5) : (o.backWidth ?? 1)}" style="stroke-opacity:${opacity}"/>`;
  }

  const fade = o.fade;
  const mask = fade
    ? `<defs><linearGradient id="${o.id}-f" x1="${fade[0]}" x2="${fade[1]}" y1="0" y2="0" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
      `<mask id="${o.id}-m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="${W + 20}" height="${H + 40}">` +
      `<rect x="-10" y="-10" width="${W + 20}" height="${H + 40}" fill="url(#${o.id}-f)"/></mask></defs>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" aria-hidden="true" focusable="false"` +
    ` class="${o.class ?? 'ridgelines'}" preserveAspectRatio="${o.align ?? 'xMid'}YMax slice">` +
    `${mask}<g${fade ? ` mask="url(#${o.id}-m)"` : ''} stroke-linejoin="round">${paths}</g></svg>`
  );
}

/* ── Presets ──────────────────────────────────────────────────────────────── */

/** Home hero, wide screens. Flat "baseflow" under the text, storms on the right. */
export const HERO_WIDE: Omit<RidgeOptions, 'id'> = {
  width: 1600,
  lines: 15,
  spacing: 7.5,
  amplitude: 84,
  bottom: 16,
  envelope: [760, 1060],
  fade: [120, 700],
  seed: 5,
  storms: [
    { t: 300, a: 0.5, w: 34 },
    { t: 560, a: 0.6, w: 30 },
    { t: 880, a: 0.5, w: 26 },
    { t: 1010, a: 1.0, w: 24 },
    { t: 1330, a: 0.85, w: 26 },
    { t: 1470, a: 0.55, w: 30 },
  ],
};

/** Home hero, phones: fewer, shorter lines. */
export const HERO_NARROW: Omit<RidgeOptions, 'id'> = {
  width: 480,
  lines: 9,
  spacing: 6.5,
  amplitude: 46,
  bottom: 12,
  envelope: [150, 300],
  fade: [20, 200],
  seed: 9,
  step: 4,
  storms: [
    { t: 250, a: 1.0, w: 15 },
    { t: 360, a: 0.7, w: 16 },
    { t: 445, a: 0.85, w: 17 },
  ],
};

/** Quiet version under inner-page headers: few lines, low peaks, right side only. */
export function pageRidges(seed: number): Omit<RidgeOptions, 'id'> {
  const r = rng(seed * 7919 + 13);
  const storms: Storm[] = [];
  for (let t = 1000 + r() * 60; t < 1640; t += 110 + r() * 90) {
    storms.push({ t, a: 0.45 + 0.55 * r(), w: 18 + r() * 12 });
  }
  return {
    width: 1600,
    lines: 7,
    spacing: 6,
    amplitude: 40,
    bottom: 0,
    envelope: [900, 1150],
    fade: [500, 1100],
    floor: 0.05,
    seed,
    storms,
    frontOpacity: 0.6,
    backOpacity: 0.32,
    frontWidth: 1.25,
    align: 'xMax',
  };
}
