/** The site's contour motifs — fixed seeds so they never change between builds. */
import { contours, contourSvg, terrain, valueNoise, type Field } from './contours';

/** Wide terrain used behind page headers (served as /images/contours.svg and used as a CSS mask). */
export function heroContoursSvg(): string {
  const width = 1600;
  const height = 640;
  return contourSvg({
    width,
    height,
    cell: 9,
    field: terrain(11, width, height, 12, 0.3),
    levels: 20,
    indexEvery: 5,
    quantile: true,
    stroke: 1,
    indexStroke: 1.9,
  });
}

/** A single irregular summit centred in a square — rings around the headshot / logo. */
function peakField(size: number, seed: number, wobble = 0.1): Field {
  const c = size / 2;
  const n = valueNoise(seed);
  return (x, y) => {
    const dx = (x - c) / c;
    const dy = (y - c) / c;
    const r = Math.hypot(dx, dy);
    const th = Math.atan2(dy, dx);
    const stretch = 1 + wobble * Math.sin(2 * th + 0.6) + wobble * 0.6 * Math.sin(3 * th + 2.1);
    return -r * stretch + 0.08 * n(dx * 2.2 + 5, dy * 2.2 + 5);
  };
}

/**
 * Closed-ish rings around the centre of a square.
 * `radii` are fractions of the half-size (0 = centre, 1 = edge midpoint).
 */
export function peakPaths(opts: { size: number; radii: number[]; seed?: number; cell?: number; wobble?: number }) {
  return contours({
    width: opts.size,
    height: opts.size,
    cell: opts.cell ?? opts.size / 64,
    field: peakField(opts.size, opts.seed ?? 3, opts.wobble),
    levels: opts.radii.length,
    thresholds: opts.radii.map((r) => -r),
  });
}
