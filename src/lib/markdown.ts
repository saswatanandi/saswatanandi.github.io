/** Render short Markdown strings from YAML (bio, news items) to HTML at build time. */
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

let processor: Awaited<ReturnType<typeof createMarkdownProcessor>> | undefined;

async function get() {
  processor ??= await createMarkdownProcessor({ syntaxHighlight: false });
  return processor;
}

/** Block Markdown → HTML (paragraphs kept). */
export async function renderMarkdown(md: string): Promise<string> {
  return (await (await get()).render(md)).code;
}

/** Inline Markdown → HTML without the wrapping <p>. */
export async function renderInline(md: string): Promise<string> {
  const html = await renderMarkdown(md.trim());
  return html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '');
}
