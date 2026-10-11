/**
 * The site share card, /og/site.jpg: the home page and every page without its own card use it.
 * Drawn at build time from `name` and `role` in site.config.yaml (src/lib/og-card.ts).
 */
import type { APIRoute } from 'astro';
import { site } from '../../lib/config';
import { renderSiteCard } from '../../lib/og-card';

export const GET: APIRoute = async () => {
  const jpg = await renderSiteCard({ name: site.name, role: site.role, seed: 'site' });
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
