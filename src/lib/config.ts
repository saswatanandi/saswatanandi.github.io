/**
 * Loads and validates `site.config.yaml` (repo root).
 * Any mistake in the file stops the build with a readable, field-by-field message.
 */
import { parse, YAMLParseError } from 'yaml';
import { z } from 'astro/zod';
import raw from '../../site.config.yaml?raw';
import { siteConfigSchema, type SiteConfig } from '../schemas/site';

function load(): SiteConfig {
  let data: unknown;
  try {
    data = parse(raw);
  } catch (err) {
    const detail = err instanceof YAMLParseError ? err.message : String(err);
    throw new Error(`\n\n✖ site.config.yaml is not valid YAML:\n  ${detail}\n  Tip: check indentation and that text containing ":" is wrapped in quotes.\n`);
  }
  const result = siteConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`\n\n✖ site.config.yaml has problems:\n${z.prettifyError(result.error)}\n`);
  }
  return result.data;
}

export const site: SiteConfig = load();
