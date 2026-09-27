import type { IconName } from '../components/Icon.astro';
import type { LinkKey, SiteConfig } from '../schemas/site';

interface ProfileLink {
  key: LinkKey;
  label: string;
  icon: IconName;
  href: string;
}

const META: Record<LinkKey, { label: string; icon: IconName }> = {
  scholar: { label: 'Google Scholar', icon: 'scholar' },
  orcid: { label: 'ORCID', icon: 'orcid' },
  github: { label: 'GitHub', icon: 'github' },
  linkedin: { label: 'LinkedIn', icon: 'linkedin' },
  bluesky: { label: 'Bluesky', icon: 'bluesky' },
  x: { label: 'X', icon: 'x' },
  researchgate: { label: 'ResearchGate', icon: 'researchgate' },
};

/** Configured profile links in a stable order; empty ones are skipped. */
export function profileLinks(site: SiteConfig): ProfileLink[] {
  return (Object.keys(META) as LinkKey[]).flatMap((key) => {
    const href = site.links[key];
    return href ? [{ key, href, ...META[key] }] : [];
  });
}

/**
 * Email obfuscation: the address never appears as plain text in the HTML.
 * It is stored reversed + base64 and assembled by a tiny script on click/load.
 */
export function encodeEmail(email: string): string {
  return Buffer.from([...email].reverse().join(''), 'utf8').toString('base64');
}
