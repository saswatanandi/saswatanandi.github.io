// Drawing helpers shared with the research card pictures (theme2/gen.mjs).
export const f = (v) => (Math.round(v * 10) / 10).toString();
export const P = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

/** Shared stylesheet with a per-option prefix (so options never clash when inlined together). */
export function style(p) {
  return `<style>
.${p}{--${p}-ink:var(--color-text,#1b2a33);--${p}-acc:var(--color-accent,#0f6e56);--${p}-acc2:var(--color-accent-2,#1d9e75);--${p}-acc3:var(--color-accent-3,#5dcaa5);--${p}-warm:var(--color-warm,#ba7517);--${p}-muted:var(--color-text-muted,#45565f);--${p}-faint:var(--color-text-faint,#5d6d76);--${p}-surf:var(--color-surface,#fff);--${p}-surf2:var(--color-surface-2,#eef3f4)}
.${p}-land{fill:url(#${p}-g)}.${p}-g1{stop-color:color-mix(in srgb,var(--${p}-ink) 12%,transparent)}.${p}-g2{stop-color:color-mix(in srgb,var(--${p}-ink) 0%,transparent)}
.${p}-edge{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 45%,transparent);stroke-width:1.5;stroke-linejoin:round}
.${p}-hair{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 22%,transparent);stroke-width:1.2;stroke-dasharray:2 5;stroke-linecap:round}
.${p}-tree{fill:var(--${p}-acc)}.${p}-tree2{fill:var(--${p}-acc2);opacity:.55}
.${p}-shrub{fill:var(--${p}-acc2);opacity:.8}
.${p}-water{fill:var(--${p}-acc3);opacity:.75}
.${p}-cloud{fill:var(--${p}-surf);stroke:color-mix(in srgb,var(--${p}-ink) 40%,transparent);stroke-width:1.5}
.${p}-rain{stroke:var(--${p}-acc2);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:7 6}
.${p}-snow{fill:none;stroke:var(--${p}-faint);stroke-width:1.4;stroke-linecap:round}
.${p}-et{fill:none;stroke:var(--${p}-acc);stroke-width:3.2;stroke-linecap:round}
.${p}-et-s{fill:none;stroke:var(--${p}-acc);stroke-width:1.8;stroke-linecap:round}
.${p}-head{fill:var(--${p}-acc)}
.${p}-flow{fill:none;stroke:var(--${p}-acc2);stroke-width:2.6;stroke-linecap:round}
.${p}-flowh{fill:var(--${p}-acc2)}
.${p}-dam{fill:var(--${p}-muted)}
.${p}-sun{fill:var(--${p}-warm)}.${p}-ray{stroke:var(--${p}-warm);stroke-width:2;stroke-linecap:round}
</style>`;
}
export const grad = (p) =>
  `<defs><linearGradient id="${p}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="${p}-g1"/><stop offset="1" class="${p}-g2"/></linearGradient></defs>`;

/** Layered conifer exactly like theme 1's: `h` = crown height, base at (x, y). */
export function tree(p, x, y, h, cls = 'tree') {
  const w = h * 0.55;
  const t = y - h;
  const d = [
    [x, t], [x + w * 0.2, t + h * 0.36], [x + w * 0.12, t + h * 0.36], [x + w * 0.34, t + h * 0.7], [x + w * 0.24, t + h * 0.7],
    [x + w * 0.5, y], [x - w * 0.5, y], [x - w * 0.24, t + h * 0.7], [x - w * 0.34, t + h * 0.7], [x - w * 0.12, t + h * 0.36], [x - w * 0.2, t + h * 0.36],
  ];
  return `<path class="${p}-${cls}" d="M${P(d)} Z"/><rect class="${p}-${cls}" x="${f(x - 1.4)}" y="${f(y - 0.6)}" width="2.8" height="${f(h * 0.22)}"/>`;
}
export function cloud(p, x, y, s = 1) {
  // theme 1's cloud outline, scaled about its left end
  const pts = 'M210,60 C192,60 188,38 206,35 C208,20 230,14 242,24 C250,8 282,6 292,22 C304,12 330,14 332,30 C352,26 366,42 356,56 C360,60 358,60 350,60 Z';
  return `<path class="${p}-cloud" transform="translate(${f(x)} ${f(y)}) scale(${s}) translate(-210 -60)" d="${pts}"/>`;
}
export const rain = (p, x, y, len = 16) => `<line class="${p}-rain" x1="${f(x)}" y1="${f(y)}" x2="${f(x - len / 2)}" y2="${f(y + len)}"/>`;
/** ET arrow: wavy shaft + filled head (theme 1 geometry). */
export function et(p, x, y0, y1, small = false) {
  const m = (y0 + y1) / 2;
  const shaft = `<path class="${p}-${small ? 'et-s' : 'et'}" d="M${f(x)},${f(y0)} C${f(x + 7)},${f(m + (y0 - m) * 0.3)} ${f(x - 7)},${f(m - (m - y1) * 0.4)} ${f(x)},${f(y1)}"/>`;
  const hw = small ? 4.5 : 6;
  const hh = small ? 8 : 11;
  return shaft + `<path class="${p}-head" d="M${f(x)},${f(y1 - hh + 1)} l${hw},${hh} l${-2 * hw},0 Z"/>`;
}
/** Flow arrow head pointing along (dx, dy) at tip (x, y). */
export function head(p, x, y, dx, dy, s = 11, cls = 'flowh') {
  const L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const bx = x - ux * s, by = y - uy * s;
  const w = s * 0.5;
  return `<path class="${p}-${cls}" d="M${f(x)},${f(y)} L${f(bx - uy * w)},${f(by + ux * w)} L${f(bx + uy * w)},${f(by - ux * w)} Z"/>`;
}
export const sun = (p, x, y, r = 9) => {
  let rays = '';
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    rays += `<line class="${p}-ray" x1="${f(x + Math.cos(a) * (r + 4))}" y1="${f(y + Math.sin(a) * (r + 4))}" x2="${f(x + Math.cos(a) * (r + 9))}" y2="${f(y + Math.sin(a) * (r + 9))}"/>`;
  }
  return `<circle class="${p}-sun" cx="${x}" cy="${y}" r="${r}"/>${rays}`;
};
