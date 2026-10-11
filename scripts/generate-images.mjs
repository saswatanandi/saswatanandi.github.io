#!/usr/bin/env node
/**
 * Regenerates the raster brand images in public/ from the same generators the
 * site uses (src/lib/logo.ts, src/lib/ridgelines.ts):
 *
 *   public/favicon-32.png        32×32   contour-drop mark (PNG fallback for favicon.svg)
 *   public/apple-touch-icon.png  180×180 white mark on a teal tile
 *
 * Usage:  node scripts/generate-images.mjs
 * Needs:  Node >= 22.18 (runs the .ts libraries directly) and Playwright with
 *         Chromium (`npm i -D playwright && npx playwright install chromium`),
 *         or point PLAYWRIGHT_MODULE at an existing install's index.mjs.
 * The site share card is no longer made here: /og/site.jpg is drawn at every build
 * (src/pages/og/site.jpg.ts).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { markBody } from '../src/lib/logo.ts';
import { HERO_WIDE, ridgelinesSvg } from '../src/lib/ridgelines.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const site = parse(readFileSync(join(root, 'site.config.yaml'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = (pkg, file) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href;

const LIGHT = { bg: '#f7f9fa', text: '#1b2a33', muted: '#45565f', accent: '#0f6e56', contour: '#0f6e56' };

const mark = (size, fill, small = size <= 24) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}" fill="none">${markBody(`m${size}`, small, fill)}</svg>`;

const page = (w, h, body, css = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Source Serif 4";src:url(${font('source-serif-4', 'source-serif-4-latin-wght-normal.woff2')}) format("woff2");font-weight:200 900}
@font-face{font-family:"Inter";src:url(${font('inter', 'inter-latin-wght-normal.woff2')}) format("woff2");font-weight:100 900}
:root{--color-bg:${LIGHT.bg};--color-accent:${LIGHT.accent}}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}
${css}</style></head><body>${body}</body></html>`;

const jobs = [
  {
    out: 'public/favicon-32.png',
    w: 32,
    h: 32,
    // mid teal reads on both light and dark tab strips
    html: page(32, 32, mark(32, '#1d9e75', true)),
    transparent: true,
  },
  {
    out: 'public/apple-touch-icon.png',
    w: 180,
    h: 180,
    html: page(180, 180, `<div class="t">${mark(118, '#ffffff', false)}</div>`,
      `.t{width:180px;height:180px;background:${LIGHT.accent};display:grid;place-items:center}.t svg{margin-top:-4px}`),
  },
];

const dir = mkdtempSync(join(tmpdir(), 'brand-'));
const browser = await chromium.launch();
try {
  for (const j of jobs) {
    const file = join(dir, 'page.html');
    writeFileSync(file, j.html);
    const p = await browser.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(file).href);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(root, j.out), omitBackground: !!j.transparent });
    await p.close();
    console.log('wrote', j.out);
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
