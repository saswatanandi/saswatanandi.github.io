/**
 * Draws a 1200×630 share card (Open Graph image) for one page, at build time.
 *
 *   kicker   small line above the title ("Blog", "Paper · Journal · 2024")
 *   title    large serif title; the font shrinks for long titles
 *   picture  optional: shown on the right (cover-fit, rounded); without one the
 *            card is full width with the site's hydrograph ridgelines along the bottom
 *   footer   the site mark, the owner's name (site.config.yaml) and the site domain
 *
 * Layout by satori (HTML/CSS-like tree → SVG, text as outlines), rasterised by sharp.
 * Colours are the light "Topographic" palette from src/styles/tokens.css; fonts are the
 * site's own (Source Serif 4 + Inter; static .woff files, since satori cannot read woff2).
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { markBody } from './logo';
import { ridgelinesSvg, type RidgeOptions } from './ridgelines';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const C = { bg: '#f7f9fa', text: '#1b2a33', muted: '#45565f', faint: '#5d6d76', accent: '#0f6e56', border: '#dbe3e7' };

export interface CardInput {
  title: string;
  kicker: string;
  /** Optional line under the title (used when the title is short, e.g. a software name). */
  subtitle?: string;
  /** Absolute file path of a picture (jpg/png/webp/avif), or undefined for the ridgeline card. */
  image?: string;
  /** Owner's name and the site's domain, for the footer. */
  name: string;
  domain: string;
  /** Seed for the ridgeline pattern (a different storm pattern per page). */
  seed: string;
}

/* ── Fonts (loaded once) ─────────────────────────────────────────────── */

const require = createRequire(import.meta.url);
const fontFile = (pkg: string, file: string) => readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));
type Font = { name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: 'normal' };
let fonts: Font[] | undefined;
function loadFonts(): Font[] {
  if (fonts) return fonts;
  const f = (name: string, pkg: string, weight: Font['weight']): Font[] =>
    ['latin', 'latin-ext'].map((subset) => ({
      name,
      data: fontFile(pkg, `${pkg}-${subset}-${weight}-normal.woff`),
      weight,
      style: 'normal' as const,
    }));
  fonts = [...f('Serif', 'source-serif-4', 600), ...f('Sans', 'inter', 500), ...f('Sans', 'inter', 600)];
  return fonts;
}

/* ── Text fitting ────────────────────────────────────────────────────── */

/** Rough advance widths (in em) for Source Serif 4 semibold: enough to pick a font size. */
function charWidth(ch: string): number {
  if (ch === ' ') return 0.25;
  if (/[iljtfr.,:;'’!|()\[\]\-]/.test(ch)) return 0.33;
  if (/[mwMW]/.test(ch)) return 0.82;
  if (/[A-Z0-9]/.test(ch)) return 0.64;
  return 0.52;
}
/** Lines needed to set `text` at `size` px in a column `width` px wide (greedy word wrap). */
function countLines(text: string, size: number, width: number): number {
  width /= 1.06; // safety margin: better a size too small than a clipped title
  const space = charWidth(' ') * size;
  let lines = 1;
  let x = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const w = [...word].reduce((s, ch) => s + charWidth(ch), 0) * size;
    if (x > 0 && x + space + w > width) {
      lines++;
      x = w;
    } else x += (x > 0 ? space : 0) + w;
  }
  return lines;
}
const LEADING = 1.14;
/** Largest size (from a fixed scale) whose wrapped title fits within maxLines and maxHeight. */
function fitTitle(text: string, width: number, maxHeight: number, maxLines: number, sizes: number[]) {
  for (const size of sizes) {
    const lines = countLines(text, size, width);
    if (lines <= maxLines && lines * size * LEADING <= maxHeight) return { size, lines };
  }
  const size = sizes[sizes.length - 1]!;
  return { size, lines: Math.min(maxLines, Math.floor(maxHeight / (size * LEADING))) };
}

/* ── Raster pieces ───────────────────────────────────────────────────── */

const dataUri = (buf: Buffer, type: string) => `data:${type};base64,${buf.toString('base64')}`;

/** The ridgeline motif with the CSS custom properties resolved to the light palette. */
async function ridgesPng(seed: string, width: number, height: number): Promise<string> {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const r = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const storms: RidgeOptions['storms'] = [];
  for (let t = 520 + r() * 80; t < 1230; t += 120 + r() * 110) storms.push({ t, a: 0.45 + 0.55 * r(), w: 22 + r() * 12 });
  const svg = ridgelinesSvg({
    id: 'og',
    width,
    lines: 12,
    spacing: 7,
    amplitude: 72,
    bottom: 10,
    envelope: [420, 760],
    fade: [60, 560],
    floor: 0.06,
    seed: (h >>> 0) % 1000,
    storms,
    frontOpacity: 0.8,
    backOpacity: 0.38,
    align: 'xMax',
  })
    .replace(/var\(--color-bg\)/g, C.bg)
    .replace(/var\(--color-accent\)/g, C.accent)
    .replace(/currentColor/g, C.accent)
    .replace(/var\(--ridge-(?:front|back), ([\d.]+)\)/g, '$1')
    .replace(/calc\(([\d.]+) \* ([\d.]+)\)/g, (_, a: string, b: string) => (Number(a) * Number(b)).toFixed(3))
    .replace('<svg ', `<svg width="${width}" height="${height}" `);
  return dataUri(await sharp(Buffer.from(svg)).png().toBuffer(), 'image/png');
}

async function markPng(size: number): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size * 2}" height="${size * 2}" fill="none">${markBody('ogm', false, C.accent)}</svg>`;
  return dataUri(await sharp(Buffer.from(svg)).png().toBuffer(), 'image/png');
}

/** Picture resized to exactly fill its box (centre crop), as a JPEG data URI. */
async function picture(path: string, width: number, height: number): Promise<string> {
  const buf = await sharp(readFileSync(path))
    .rotate()
    .resize(width * 2 > 1400 ? width : width * 2, height * 2 > 1400 ? height : height * 2, { fit: 'cover', position: 'attention' })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82 })
    .toBuffer();
  return dataUri(buf, 'image/jpeg');
}

/* ── The card ────────────────────────────────────────────────────────── */

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown>; children?: unknown } };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { ...extra, style, ...(children !== undefined ? { children } : {}) },
});

export async function renderCard(input: CardInput): Promise<Buffer> {
  const PAD = 72;
  const withPic = !!input.image;
  const PIC_W = 520;
  const PIC_H = OG_HEIGHT - 2 * 48;
  const RIDGE_H = 168;
  const textW = withPic ? OG_WIDTH - PAD - PIC_W - 48 - 56 : OG_WIDTH - 2 * PAD;

  // Vertical room for the title between the kicker and the footer (less a subtitle, if any).
  const subtitle = input.subtitle?.trim();
  const maxH = (withPic ? 380 : 300) - (subtitle ? 90 : 0);
  // Typographic apostrophes and quotes read better at display size.
  const titleText = input.title
    .replace(/(\w)'(\w)/g, '$1\u2019$2')
    .replace(/(^|[\s(])'/g, '$1\u2018')
    .replace(/'/g, '\u2019')
    .replace(/(^|[\s(])"/g, '$1\u201c')
    .replace(/"/g, '\u201d');
  const { size, lines } = fitTitle(
    titleText,
    textW,
    maxH,
    withPic ? 7 : 5,
    withPic ? [64, 58, 52, 48, 44, 40, 36, 32] : [80, 72, 64, 58, 52, 48, 44, 40, 36],
  );

  const mark = await markPng(40);
  const kicker = el(
    'div',
    {
      display: 'block',
      maxWidth: textW,
      fontFamily: 'Sans',
      fontWeight: 600,
      fontSize: 24,
      letterSpacing: '0.06em',
      color: C.accent,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    input.kicker,
  );
  const title = el(
    'div',
    {
      display: 'block',
      fontFamily: 'Serif',
      fontWeight: 600,
      fontSize: size,
      lineHeight: LEADING,
      letterSpacing: '-0.015em',
      color: C.text,
      lineClamp: lines,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: textW,
    },
    titleText,
  );
  const sub = subtitle
    ? el(
        'div',
        { display: 'block', marginTop: 22, fontFamily: 'Sans', fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: C.muted, lineClamp: 2, maxWidth: textW },
        subtitle,
      )
    : null;
  const footer = el('div', { display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'Sans', fontWeight: 500, fontSize: 24, color: C.muted }, [
    el('img', { width: 40, height: 40 }, undefined, { src: mark, width: 40, height: 40 }),
    el('div', { display: 'flex' }, [
      el('span', { color: C.text, fontWeight: 600 }, input.name),
      el('span', { margin: '0 12px', color: C.faint }, '·'),
      el('span', {}, input.domain),
    ]),
  ]);

  const textCol = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: withPic ? textW + PAD : OG_WIDTH,
      height: withPic ? OG_HEIGHT : OG_HEIGHT - RIDGE_H + 40,
      padding: `56px ${withPic ? 0 : PAD}px ${withPic ? 56 : 8}px ${PAD}px`,
    },
    [kicker, el('div', { display: 'flex', flexDirection: 'column' }, [title, ...(sub ? [sub] : [])]), footer],
  );

  const children: Node[] = [textCol];
  if (withPic) {
    children.push(
      el('img', { position: 'absolute', right: 48, top: 48, width: PIC_W, height: PIC_H, objectFit: 'cover', borderRadius: 20 }, undefined, {
        src: await picture(input.image!, PIC_W, PIC_H),
        width: PIC_W,
        height: PIC_H,
      }),
    );
  } else {
    children.push(
      el('img', { position: 'absolute', left: 0, bottom: 0, width: OG_WIDTH, height: RIDGE_H }, undefined, {
        src: await ridgesPng(input.seed, OG_WIDTH, RIDGE_H),
        width: OG_WIDTH,
        height: RIDGE_H,
      }),
    );
  }
  // A thin accent rule on the left edge ties the card to the site's headings.
  children.push(el('div', { position: 'absolute', left: 0, top: 0, width: 10, height: OG_HEIGHT, background: C.accent }));

  const root = el('div', { display: 'flex', position: 'relative', width: OG_WIDTH, height: OG_HEIGHT, background: C.bg }, children);
  const svg = await satori(root as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: false }).toBuffer();
}
