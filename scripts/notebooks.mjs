#!/usr/bin/env node
/**
 * Jupyter notebook posts → Markdown, using the outputs saved in the notebook (nothing is executed,
 * so no Python is needed). Runs automatically before `npm run dev` and `npm run build`.
 *
 *   src/content/blog/<slug>/index.ipynb   →  src/content/blog/<slug>/index.ipynb.md   (generated)
 *                                          →  src/content/blog/<slug>/nb-output/*.png   (generated)
 *
 * Front matter (title, description, date, tags, …, the same fields as a Markdown post) comes from
 *   - the first cell, if it is a Markdown cell that starts with a "---" YAML block, or
 *   - a file meta.yaml next to the notebook.
 *
 * Cells: Markdown as written; code as a highlighted block; outputs: text, images (PNG/JPEG/SVG),
 * Markdown and LaTeX. HTML outputs are kept only when they are simple (tables); widgets are skipped.
 * Cell tags (set in Jupyter): "remove-cell" drops a cell, "remove-input" keeps only its outputs,
 * "remove-output" keeps only its code.
 *
 * The generated files are git-ignored: commit only the notebook (and meta.yaml).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = join(ROOT, 'src/content/blog');
const OUT_MD = 'index.ipynb.md';
const OUT_DIR = 'nb-output';

/** @param {string} dir @returns {string[]} */
function findNotebooks(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === OUT_DIR || name.startsWith('.') ? [] : findNotebooks(p);
    return name === 'index.ipynb' ? [p] : [];
  });
}

/** @param {string | string[] | undefined} src */
const joinSource = (src) => (Array.isArray(src) ? src.join('') : (src ?? ''));
// eslint-disable-next-line no-control-regex
const stripAnsi = (s) => s.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '');
/** A fence longer than any backtick run in the text. */
function fence(text, lang = '') {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
  const f = '`'.repeat(longest + 1);
  return `${f}${lang}\n${text.replace(/\n+$/, '')}\n${f}`;
}

/** HTML output kept only if it is plain markup (e.g. a pandas table): no scripts, styles, iframes or widgets. */
function simpleHtml(html) {
  const cleaned = html.replace(/<style[\s\S]*?<\/style>/gi, '').trim();
  if (/<(script|iframe|object|embed|link|form|input)\b/i.test(cleaned) || /\bon\w+=/i.test(cleaned)) return null;
  if (!/<table\b/i.test(cleaned)) return null;
  return `<div class="nb-html">\n${cleaned}\n</div>`;
}

class NotebookError extends Error {}

/** @param {string} file */
function convert(file) {
  const dir = dirname(file);
  const rel = relative(ROOT, file);
  let nb;
  try {
    nb = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    throw new NotebookError(`${rel} is not valid notebook JSON (${e instanceof Error ? e.message : e}).`);
  }
  if (!Array.isArray(nb.cells)) throw new NotebookError(`${rel} has no cells (nbformat 4 expected).`);
  const lang = nb.metadata?.kernelspec?.language || nb.metadata?.language_info?.name || 'python';

  // Front matter: first Markdown cell starting with ---, else meta.yaml.
  const cells = [...nb.cells];
  let frontMatter = '';
  const first = cells[0];
  const firstSrc = first?.cell_type === 'markdown' ? joinSource(first.source) : '';
  const m = /^\s*---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(firstSrc);
  if (m) {
    frontMatter = m[1];
    const rest = firstSrc.slice(m[0].length).trim();
    if (rest) cells[0] = { ...first, source: rest };
    else cells.shift();
  } else if (existsSync(join(dir, 'meta.yaml'))) {
    frontMatter = readFileSync(join(dir, 'meta.yaml'), 'utf8').trim();
  } else {
    throw new NotebookError(
      `${rel} has no front matter. Put a YAML block (between --- lines, with title, description, date, tags) ` +
        `in the first Markdown cell, or add ${relative(ROOT, join(dir, 'meta.yaml'))}.`,
    );
  }

  const outDir = join(dir, OUT_DIR);
  rmSync(outDir, { recursive: true, force: true });
  let images = 0;
  /** @param {string} data base64 or text @param {string} ext */
  const saveImage = (data, ext, cellNo, alt = 'Output') => {
    mkdirSync(outDir, { recursive: true });
    const name = `cell${cellNo}-${++images}.${ext}`;
    const payload = Array.isArray(data) ? data.join('') : data;
    writeFileSync(join(outDir, name), ext === 'svg' ? payload : Buffer.from(payload.replace(/\s/g, ''), 'base64'));
    return `![${alt}](./${OUT_DIR}/${name})`;
  };

  const blocks = [];
  cells.forEach((cell, i) => {
    const cellNo = i + 1;
    const tags = cell.metadata?.tags ?? [];
    if (tags.includes('remove-cell')) return;
    const src = joinSource(cell.source);

    if (cell.cell_type === 'markdown') {
      // Images pasted into Markdown cells are stored as attachments.
      let md = src;
      for (const [name, bundle] of Object.entries(cell.attachments ?? {})) {
        const mime = Object.keys(bundle).find((k) => k.startsWith('image/'));
        if (!mime) continue;
        const ext = mime === 'image/svg+xml' ? 'svg' : mime.split('/')[1].replace('jpeg', 'jpg');
        const link = saveImage(bundle[mime], ext, cellNo).replace(/^!\[Output\]\((.*)\)$/, '$1');
        md = md.split(`attachment:${name}`).join(link);
      }
      // Jupyter shows $$...$$ on one line as display maths; the site's Markdown needs it on its own lines.
      md = md.replace(/^([ \t]*)\$\$(.+?)\$\$[ \t]*$/gm, '$1$$$$\n$1$2\n$1$$$$');
      if (md.trim()) blocks.push(md.trim());
      return;
    }
    if (cell.cell_type === 'raw') {
      if (src.trim()) blocks.push(src.trim());
      return;
    }
    if (cell.cell_type !== 'code') return;

    if (!tags.includes('remove-input') && src.trim()) blocks.push(fence(src, lang));
    if (tags.includes('remove-output')) return;

    for (const out of cell.outputs ?? []) {
      if (out.output_type === 'stream') {
        if (out.name === 'stderr') continue; // warnings and progress bars
        const text = stripAnsi(joinSource(out.text));
        if (text.trim()) blocks.push(fence(text, 'text'));
      } else if (out.output_type === 'error') {
        const text = stripAnsi((out.traceback ?? [`${out.ename}: ${out.evalue}`]).join('\n'));
        blocks.push(fence(text, 'text'));
      } else if (out.output_type === 'execute_result' || out.output_type === 'display_data') {
        const d = out.data ?? {};
        if (d['image/png']) blocks.push(saveImage(d['image/png'], 'png', cellNo));
        else if (d['image/jpeg']) blocks.push(saveImage(d['image/jpeg'], 'jpg', cellNo));
        else if (d['image/svg+xml']) blocks.push(saveImage(d['image/svg+xml'], 'svg', cellNo));
        else if (d['text/markdown']) blocks.push(joinSource(d['text/markdown']).trim());
        else if (d['text/latex']) blocks.push(joinSource(d['text/latex']).trim());
        else if (d['text/html'] && simpleHtml(joinSource(d['text/html']))) blocks.push(simpleHtml(joinSource(d['text/html'])));
        else if (d['text/plain'] && !d['application/vnd.jupyter.widget-view+json']) {
          const text = stripAnsi(joinSource(d['text/plain']));
          if (text.trim()) blocks.push(fence(text, 'text'));
        }
      }
    }
  });

  const md =
    `---\n${frontMatter}\n---\n\n` +
    `<!-- Generated from index.ipynb by scripts/notebooks.mjs. Edit the notebook, not this file. -->\n\n` +
    blocks.join('\n\n') +
    '\n';
  writeFileSync(join(dir, OUT_MD), md);
  return { rel, cells: cells.length, images };
}

/** Remove generated files whose notebook is gone. */
function cleanOrphans(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (!existsSync(join(p, 'index.ipynb'))) {
      if (existsSync(join(p, OUT_MD))) rmSync(join(p, OUT_MD));
      if (existsSync(join(p, OUT_DIR))) rmSync(join(p, OUT_DIR), { recursive: true });
    }
    if (name !== OUT_DIR) cleanOrphans(p);
  }
}

cleanOrphans(BLOG);
const notebooks = findNotebooks(BLOG);
let failed = false;
for (const file of notebooks) {
  try {
    const r = convert(file);
    console.log(`notebooks: ${r.rel} → ${OUT_MD} (${r.cells} cells, ${r.images} images)`);
  } catch (e) {
    failed = true;
    console.error(`\n✖ ${e instanceof NotebookError ? e.message : e instanceof Error ? e.stack : e}\n`);
  }
}
if (failed) process.exit(1);
