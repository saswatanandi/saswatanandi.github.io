/**
 * Headshot frame: one hairline ring with four short graticule ticks at
 * N / E / S / W, like the neatline of a map sheet.
 *
 * Geometry is in a 100×100 box; the photo is a circle of radius `photoR`
 * centred in it. Strokes use `vector-effect: non-scaling-stroke`, so they
 * stay 1 px whatever size the frame is rendered at.
 */

export interface FrameGeometry {
  /** photo radius (box units) */
  photoR: number;
  ring: number;
  ticks: string;
}

export function frameGeometry(photoR = 42): FrameGeometry {
  const ring = photoR + 3.6;
  const t0 = ring + 1.4;
  const t1 = ring + 4.4;
  const c = 50;
  const ticks = [
    `M${c} ${c - t0}V${c - t1}`,
    `M${c + t0} ${c}H${c + t1}`,
    `M${c} ${c + t0}V${c + t1}`,
    `M${c - t0} ${c}H${c - t1}`,
  ].join('');
  return { photoR, ring: +ring.toFixed(2), ticks };
}
