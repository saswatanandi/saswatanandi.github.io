/**
 * A small content-layer loader for the hand-edited YAML files in `src/data/`.
 *
 * Why not Astro's built-in `file()` loader?
 *  - It needs an `id` on every list item (annoying to type by hand) — we derive ids.
 *  - A YAML syntax error there is only logged; here it stops the build with the
 *    line/column so the mistake is obvious in the GitHub Actions log.
 *
 * The file is a YAML list; every item becomes one entry.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse, YAMLParseError } from 'yaml';
import type { Loader } from 'astro/loaders';

type Item = Record<string, unknown>;

interface Options {
  /** Path relative to the project root, e.g. "src/data/news.yaml". */
  path: string;
  /** Build an id for a list item (defaults to a slug of `id` / `name` / `title`, else the index). */
  id?: (item: Item, index: number) => string;
  /**
   * Change the items after reading the file and before validation, e.g. fill in fields from a cache.
   * Ids are made from the items as typed, so they do not change when this hook adds fields.
   */
  prepare?: (items: Item[], root: URL) => Item[] | Promise<Item[]>;
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function defaultId(item: Item, index: number): string {
  for (const key of ['id', 'slug', 'name', 'title']) {
    const v = item[key];
    if (typeof v === 'string' && v.trim()) return slugify(v);
  }
  return String(index + 1);
}

/**
 * Entry ids for the items of a list file, in file order: `idFn` (default: a slug of id / slug / name / title),
 * with -2, -3 … added to repeats. Also used to sort a collection in the order of its file.
 */
export function listIds(items: Item[], idFn: Options['id'] = defaultId): string[] {
  const seen = new Map<string, number>();
  return items.map((item, index) => {
    const id = idFn(item, index);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    return n > 0 ? `${id}-${n + 1}` : id;
  });
}

export function yamlLoader(opts: Options): Loader {
  return {
    name: 'yaml-data-loader',
    load: async ({ config, store, parseData, logger, watcher }) => {
      const url = new URL(opts.path, config.root);
      const filePath = fileURLToPath(url);

      const sync = async () => {
        const text = await readFile(filePath, 'utf-8');
        let data: unknown;
        try {
          data = parse(text);
        } catch (err) {
          const detail = err instanceof YAMLParseError ? err.message : String(err);
          throw new Error(`\n✖ ${opts.path} is not valid YAML:\n  ${detail}\n`);
        }

        if (data == null) data = [];
        if (!Array.isArray(data)) {
          throw new Error(`\n✖ ${opts.path} must be a YAML list (each item starts with "- ").\n`);
        }
        for (const [index, raw] of data.entries()) {
          if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
            throw new Error(`\n✖ ${opts.path}: item #${index + 1} must be a mapping of "key: value" fields.\n`);
          }
        }
        // Unique ids without making the author care about it (from the items as typed).
        const ids = listIds(data as Item[], opts.id);
        const items = opts.prepare ? await opts.prepare(data as Item[], config.root) : (data as Item[]);
        // Check every item first; only then replace the stored entries. A mistake while the dev
        // server is running then keeps the last good list on screen instead of an empty page.
        const entries = [];
        for (const [index, item] of items.entries()) {
          const id = ids[index]!;
          entries.push({ id, data: await parseData({ id, data: item, filePath }), filePath: opts.path });
        }
        store.clear();
        for (const e of entries) store.set(e);
      };

      await sync();
      watcher?.add(filePath);
      watcher?.on('change', async (changed) => {
        if (changed === filePath) {
          logger.info(`Reloading ${opts.path}`);
          try {
            await sync();
          } catch (err) {
            logger.error(String(err));
          }
        }
      });
    },
  };
}
