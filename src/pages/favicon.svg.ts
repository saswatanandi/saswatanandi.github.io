/** SVG favicon: the contour-drop mark, teal that follows the browser colour scheme. */
import type { APIRoute } from 'astro';
import { faviconSvg } from '../lib/logo';

export const GET: APIRoute = () =>
  new Response(faviconSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
