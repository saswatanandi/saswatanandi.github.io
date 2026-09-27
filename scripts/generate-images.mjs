#!/usr/bin/env node
/**
 * Regenerates the raster brand images in public/ from the same generators the
 * site uses (src/lib/logo.ts, src/lib/ridgelines.ts):
 *
 *   public/favicon-32.png        32×32   contour-drop mark (PNG fallback for favicon.svg)
 *   public/apple-touch-icon.png  180×180 white mark on a teal tile
 *   public/og-default.png        1200×630 social card: mark, name, role, ridgelines
 *
 * Usage:  node scripts/generate-images.mjs
 * Needs:  Node >= 22.18 (runs the .ts libraries directly) and Playwright with
 *         Chromium (`npm i -D playwright && npx playwright install chromium`),
 *         or point PLAYWRIGHT_MODULE at an existing install's index.mjs.
 * The name and role come from site.config.yaml, so nothing is hard-coded here.
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
  {
    out: 'public/og-default.png',
    w: 1200,
    h: 630,
    html: page(
      1200,
      630,
      `<div class="og">
        <div class="id">${mark(92, LIGHT.accent, false)}
          <div><p class="name">${esc(site.name)}</p><p class="role">${esc(site.role)}</p></div>
        </div>
        <div class="ridges">${ridgelinesSvg({ ...HERO_WIDE, id: 'og' }).replace('xMidYMax', 'xMaxYMax')}</div>
      </div>`,
      `.og{position:relative;width:1200px;height:630px;background:${LIGHT.bg};color:${LIGHT.text};font-family:Inter,sans-serif}
       .id{position:absolute;left:80px;top:160px;display:flex;align-items:center;gap:30px}
       .name{margin:0;font-family:"Source Serif 4",serif;font-weight:600;font-size:84px;letter-spacing:-.025em;line-height:1}
       .role{margin:18px 0 0;font-size:30px;font-weight:500;color:${LIGHT.muted}}
       .ridges{position:absolute;left:0;right:0;bottom:0;height:230px;color:${LIGHT.contour}}
       .ridges svg{display:block;width:100%;height:100%}`,
    ),
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
