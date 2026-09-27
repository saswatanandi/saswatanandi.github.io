/** SVG favicon: the contour-summit mark on a teal tile (generated at build time). */
import type { APIRoute } from 'astro';
import { peakPaths } from '../lib/motifs';

export function faviconSvg(): string {
  const rings = peakPaths({ size: 64, radii: [0.2, 0.5, 0.8], seed: 5, wobble: 0.12, cell: 1 });
  const paths = rings
    .map((r, i) => `<path d="${r.d}" stroke-width="${i === 0 ? 4.4 : 3.6}" opacity="${1 - i * 0.2}"/>`)
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="#0f6e56"/>` +
    `<g transform="translate(5 5) scale(.84375)" fill="none" stroke="#fff" stroke-linecap="round">${paths}</g>` +
    `</svg>`
  );
}

export const GET: APIRoute = () =>
  new Response(faviconSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
