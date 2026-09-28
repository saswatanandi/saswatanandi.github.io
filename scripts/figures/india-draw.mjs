// The VIC → RAPID → LISFLOOD-FP landscape (India figure, option A), shared by the
// sheet and by the site asset generator.
import { f, P, style, grad, tree, cloud, rain, et, head, sun } from './draw.mjs';
const svgOpen = (p, w, h, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="${p}">${style(p).replace('</style>', extra + '</style>')}${grad(p)}`;
export function drawA(p, H = 360) {
  const W = 720;
  const css = `
.${p}-l1{fill:var(--${p}-acc3);opacity:.12}.${p}-l2{fill:var(--${p}-acc3);opacity:.22}.${p}-l3{fill:var(--${p}-acc3);opacity:.34}
.${p}-lay{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 26%,transparent);stroke-width:1.1;stroke-dasharray:3 4}
.${p}-cut{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 45%,transparent);stroke-width:1.5}
.${p}-flood{fill:var(--${p}-acc3);opacity:.5}
.${p}-floodl{fill:none;stroke:var(--${p}-acc2);stroke-width:1.5;stroke-dasharray:5 4}
.${p}-house{fill:var(--${p}-muted)}
.${p}-bf{fill:none;stroke:var(--${p}-acc2);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:1 6}
.${p}-zone{fill:none;stroke:color-mix(in srgb,var(--${p}-ink) 18%,transparent);stroke-width:1;stroke-dasharray:2 4}`;
  // land surface: slope 0–290, valley + reservoir 290–430, dam 430, floodplain 450–720
  const surf = (x) => 112 + 128 * Math.pow(x / 290, 1.3) + 6 * Math.sin(x / 40 + 0.5);
  const land = [];
  for (let x = 0; x <= 280; x += 4) land.push([x, surf(x)]);
  const yv = surf(280);
  const FP = 292;
  const tail = [[288, yv + 6], [300, yv + 20], [336, yv + 30], [376, yv + 30], [404, yv + 20], [418, yv + 6], [418, yv - 6], [430, yv - 6], [440, FP - 2],
    [520, FP], [566, FP + 2], [572, FP + 18], [584, FP + 22], [596, FP + 18], [602, FP + 2], [660, FP], [690, FP - 16], [720, FP - 26]];
  const outline = [...land, ...tail];
  const D = [0, 14, 38, 74];
  const band = (a, b) => `M${P(land.map(([x, y]) => [x, y + a]))} L${P(land.map(([x, y]) => [x, y + b]).reverse())} Z`;
  let s = svgOpen(p, W, H, css);
  s += `<path class="${p}-land" d="M${P(outline)} L${W},360 L0,360 Z"/>`;
  s += `<path class="${p}-l1" d="${band(D[0], D[1])}"/><path class="${p}-l2" d="${band(D[1], D[2])}"/><path class="${p}-l3" d="${band(D[2], D[3])}"/>`;
  for (const d of [D[1], D[2]]) s += `<path class="${p}-lay" d="M${P(land.map(([x, y]) => [x, y + d]))}"/>`;
  s += `<path class="${p}-cut" d="M${P(land.map(([x, y]) => [x, y + D[3]]))} L280,${f(yv)}"/>`;
  for (const x of [70, 140, 210]) s += `<path class="${p}-lay" d="M${x},${f(surf(x))} L${x},${f(surf(x) + D[3])}"/>`;
  // reservoir + floodplain water
  s += `<path class="${p}-water" d="M292,${f(yv + 10)} L416,${f(yv + 10)} L404,${f(yv + 20)} L376,${f(yv + 30)} L336,${f(yv + 30)} L300,${f(yv + 20)} Z"/>`;
  const Wl = FP - 14;
  s += `<path class="${p}-flood" d="M452,${Wl} L676,${Wl} L672,${FP - 11} L660,${FP} L602,${FP + 2} L596,${FP + 18} L584,${FP + 22} L572,${FP + 18} L566,${FP + 2} L520,${FP} L452,${FP - 1} Z"/>`;
  s += `<path class="${p}-water" d="M567,${FP + 7} L601,${FP + 7} L596,${FP + 18} L584,${FP + 22} L572,${FP + 18} Z"/>`;
  s += `<path class="${p}-floodl" d="M452,${Wl} L676,${Wl}"/>`;
  s += `<path class="${p}-edge" d="M${P(outline)}"/>`;
  s += `<rect class="${p}-dam" x="417" y="${f(yv - 10)}" width="12" height="44" rx="1.5"/>`;
  // vegetation and fluxes on the land surface
  for (const [x, h, c] of [[16, 26, 'tree2'], [34, 30, 'tree'], [52, 26, 'tree'], [88, 28, 'tree2'], [104, 32, 'tree'], [122, 26, 'tree'], [160, 26, 'tree2'], [180, 24, 'tree']]) s += tree(p, x, surf(x) + 2, h, c);
  for (const x of [226, 246, 266]) s += `<path class="${p}-shrub" d="M${x - 5},${f(surf(x) + 1)} a5,4.2 0 0 1 10,0 Z"/>`;
  s += et(p, 64, surf(64) - 34, surf(64) - 88) + et(p, 150, surf(150) - 30, surf(150) - 78, true);
  s += cloud(p, 88, 40, 0.8);
  for (let k = 0; k < 6; k++) s += rain(p, 104 + k * 14, 52 + (k % 2) * 4, k % 2 ? 16 : 13);
  const ro = [];
  for (let x = 200; x <= 272; x += 4) ro.push([x, surf(x) - 8]);
  s += `<path class="${p}-flow" d="M${P(ro)}"/>` + head(p, 282, surf(276) - 3, 1, 0.8, 11);
  const bf = [];
  for (let x = 196; x <= 276; x += 4) bf.push([x, surf(x) + 58 - (x - 196) * 0.3]);
  s += `<path class="${p}-bf" d="M${P(bf)}"/>` + head(p, 288, surf(276) + 58 - 80 * 0.3 - 3, 1, -0.3, 10);
  // routing through the reservoir and out onto the floodplain
  s += `<path class="${p}-flow" d="M436,${FP - 30} Q456,${FP - 30} 474,${FP - 27}"/>` + head(p, 484, FP - 26, 1, 0.15, 11);
  s += `<path class="${p}-flow" d="M552,${Wl - 12} L520,${Wl - 12}"/>` + head(p, 512, Wl - 12, -1, 0, 10) + `<path class="${p}-flow" d="M616,${Wl - 12} L648,${Wl - 12}"/>` + head(p, 656, Wl - 12, 1, 0, 10);
  for (const x of [624, 640]) s += `<path class="${p}-house" d="M${x},${FP - 14} l7,-7 l7,7 v14 h-14 Z"/>`;
  for (const [x, h] of [[470, 22], [486, 18], [502, 20]]) s += tree(p, x, FP - 1, h, 'tree2');
  for (const [x, h] of [[700, 26], [714, 22]]) s += tree(p, x, FP - 26 * ((x - 690) / 30) - 14, h, 'tree');
  s += sun(p, 640, 70, 10);
  // zone brackets along the bottom
  s += `<path class="${p}-zone" d="M6,346 H274 M296,346 H430 M452,346 H714"/>`;
  return s;
}
