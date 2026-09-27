/** The topographic motif, generated at build time (deterministic) and cached by browsers. */
import type { APIRoute } from 'astro';
import { heroContoursSvg } from '../../lib/motifs';

export const GET: APIRoute = () =>
  new Response(heroContoursSvg(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
