/**
 * The site mark — "contour drop": a solid water drop sliced by gently waving
 * contour lines (knocked out with a mask, so they are transparent on any
 * background). Plain geometry, drawn in `currentColor`.
 *
 * Two optical sizes: 24 px and below gets a heavier two-line drawing so it
 * stays crisp as a favicon; larger sizes get four finer lines.
 *
 * No imports, so scripts/ can run it directly with Node.
 */

const n = (v: number) => +v.toFixed(2);

/** Geometric drop: circle (cx, cy, r) with straight tangents meeting at a tip k·r above the centre. */
export function dropPath(cx: number, cy: number, r: number, k = 1.72): string {
  const phi = Math.acos(1 / k);
  const a1 = -Math.PI / 2 + phi;
  const a2 = -Math.PI / 2 - phi;
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy + r * Math.sin(a2);
  return `M${n(cx)} ${n(cy - k * r)}L${n(x1)} ${n(y1)}A${r} ${r} 0 1 1 ${n(x2)} ${n(y2)}Z`;
}

const wave = (y: number, amp: number) =>
  `M6 ${n(y)}C17 ${n(y - amp)} 23 ${n(y - amp)} 32 ${n(y)}S47 ${n(y + amp)} 58 ${n(y)}`;

export const DROP = dropPath(32, 39.5, 21.5, 1.72);

/** The inner SVG (64×64 box) of the mark. `id` must be unique within the page. */
export function markBody(id: string, small: boolean, fill = 'currentColor'): string {
  const lines: [number, number][] = small
    ? [
        [33.5, 3.2],
        [45, 3.2],
      ]
    : [
        [29, 2.6],
        [37, 2.8],
        [45, 2.8],
        [53, 2.4],
      ];
  const sw = small ? 5.2 : 2.2;
  return (
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
    `<rect width="64" height="64" fill="#fff"/>` +
    `<g stroke="#000" stroke-width="${sw}" stroke-linecap="round" fill="none">${lines.map(([y, a]) => `<path d="${wave(y, a)}"/>`).join('')}</g>` +
    `</mask><path d="${DROP}" fill="${fill}" mask="url(#${id})"/>`
  );
}

/** Stand-alone mark SVG at a given pixel size. */
export function markSvg(size: number, id = 'mark', fill = 'currentColor'): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none" aria-hidden="true" focusable="false">` +
    `${markBody(id, size <= 24, fill)}</svg>`
  );
}

/**
 * favicon.svg: the two-line mark in teal that follows the browser's colour
 * scheme (lighter teal on dark tab strips).
 */
export function faviconSvg(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<style>.m{fill:#0f6e56}@media (prefers-color-scheme:dark){.m{fill:#5dcaa5}}</style>` +
    markBody('f', true, 'currentColor').replace('fill="currentColor"', 'class="m"') +
    `</svg>`
  );
}
