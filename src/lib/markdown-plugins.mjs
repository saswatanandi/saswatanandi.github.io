// @ts-check
/**
 * Small rehype plugins for Markdown content (blog posts, reading notes), used in astro.config.mjs.
 * No dependencies beyond github-slugger (the slugger Astro itself uses for heading ids).
 *
 * - headingAnchors: ids + a "link to this section" anchor on h2–h4
 * - figures:        a paragraph holding only ![alt](src "Caption") becomes <figure> + <figcaption>
 * - callouts:       > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION] boxes (GitHub syntax)
 * - codeBlocks:     wraps highlighted code in a frame with a Copy button (see BlogCode.astro)
 * - tables:         wraps tables so wide ones scroll sideways instead of the page
 */
import Slugger from 'github-slugger';

/** @typedef {{ type: string, tagName?: string, properties?: Record<string, any>, children?: Node[], value?: string }} Node */

/** @param {Node} node @param {(node: Node, index: number, parent: Node) => void} fn */
function walk(node, fn) {
  const kids = node.children;
  if (!kids) return;
  for (let i = 0; i < kids.length; i++) {
    fn(kids[i], i, node);
    walk(kids[i], fn);
  }
}

/** @param {Node} node @returns {string} */
function textOf(node) {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

/** @param {string} tagName @param {Record<string, any>} properties @param {Node[]} [children] @returns {Node} */
const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = (/** @type {string} */ value) => ({ type: 'text', value });

const LINK_ICON = el(
  'svg',
  { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', ariaHidden: 'true' },
  [
    el('path', { d: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1' }),
    el('path', { d: 'M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1' }),
  ],
);

export function rehypeHeadingAnchors() {
  /** @param {Node} tree */
  return (tree) => {
    const slugger = new Slugger();
    walk(tree, (node) => {
      if (node.type !== 'element' || !/^h[2-4]$/.test(node.tagName ?? '')) return;
      node.properties ??= {};
      const label = textOf(node).trim();
      if (typeof node.properties.id !== 'string') node.properties.id = slugger.slug(label);
      node.children ??= [];
      node.children.push(
        el('a', { className: ['heading-anchor'], dataPagefindIgnore: 'all', href: `#${node.properties.id}`, ariaLabel: `Link to this section: ${label}` }, [
          structuredClone(LINK_ICON),
        ]),
      );
    });
  };
}

export function rehypeFigures() {
  /** @param {Node} tree */
  return (tree) => {
    walk(tree, (node, i, parent) => {
      if (node.type !== 'element' || node.tagName !== 'p') return;
      const kids = (node.children ?? []).filter((c) => !(c.type === 'text' && !c.value?.trim()));
      const img = kids[0];
      if (kids.length !== 1 || img.type !== 'element' || img.tagName !== 'img') return;
      const caption = img.properties?.title;
      if (!caption) return;
      delete img.properties?.title;
      parent.children?.splice(i, 1, el('figure', { className: ['md-figure'] }, [img, el('figcaption', {}, [text(String(caption))])]));
    });
  };
}

const CALLOUTS = /** @type {const} */ ({ NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' });

export function rehypeCallouts() {
  /** @param {Node} tree */
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'blockquote') return;
      const first = (node.children ?? []).find((c) => c.type === 'element');
      if (!first || first.tagName !== 'p') return;
      const lead = first.children?.[0];
      if (!lead || lead.type !== 'text') return;
      const m = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(lead.value ?? '');
      if (!m) return;
      const kind = /** @type {keyof typeof CALLOUTS} */ (m[1].toUpperCase());
      lead.value = (lead.value ?? '').slice(m[0].length);
      // Drop an empty first paragraph (when [!NOTE] stands on its own line).
      if (!textOf(first).trim() && (first.children ?? []).every((c) => c.type === 'text' || c.tagName === 'br')) {
        node.children = (node.children ?? []).filter((c) => c !== first);
      } else if (first.children?.[1]?.tagName === 'br') {
        first.children.splice(1, 1);
      }
      node.tagName = 'aside';
      node.properties = { className: ['callout', `callout--${kind.toLowerCase()}`] };
      node.children = [el('p', { className: ['callout__title'] }, [text(CALLOUTS[kind])]), ...(node.children ?? [])];
    });
  };
}

export function rehypeCodeBlocks() {
  /** @param {Node} tree */
  return (tree) => {
    walk(tree, (node, i, parent) => {
      if (node.type !== 'element' || node.tagName !== 'pre') return;
      if (parent.type === 'element' && parent.properties?.className?.includes?.('code-block')) return;
      const lang = node.properties?.dataLanguage;
      node.properties = { ...node.properties, tabIndex: 0 };
      const frame = el('div', { className: ['code-block'], dataLang: lang && lang !== 'plaintext' ? lang : undefined }, [
        node,
        el('button', { type: 'button', className: ['code-copy'], ariaLabel: 'Copy code', dataPagefindIgnore: 'all' }, [text('Copy')]),
      ]);
      parent.children?.splice(i, 1, frame);
    });
  };
}

export function rehypeTables() {
  /** @param {Node} tree */
  return (tree) => {
    walk(tree, (node, i, parent) => {
      if (node.type !== 'element' || node.tagName !== 'table') return;
      if (parent.type === 'element' && parent.properties?.className?.includes?.('table-wrap')) return;
      parent.children?.splice(i, 1, el('div', { className: ['table-wrap'], tabIndex: 0 }, [node]));
    });
  };
}
