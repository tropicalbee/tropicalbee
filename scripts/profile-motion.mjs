// Small flat pixel sprites; no blur, shaders, scrolling backdrops or animated text.
const TAU = Math.PI * 2;
const rect = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const cloud = '<path d="M0 10H16V4H36V0H62V5H82V10H106V19H0Z" fill="#344156"/>';
const leaf = '<path d="M0 -6H4V-3H7V2H3V6H-1V3H-4V-2H0Z" fill="#8d6840"/><path d="M0 -3V7" stroke="#b19b65" stroke-width="2"/>';
const puff = '<path d="M-10 -4H-6V-8H6V-4H12V4H7V8H-7V4H-10Z" fill="#758678"/>';
const bat = '<path d="M-2 0H-8V-5H-15V-9H-20V-3H-16V3H-9V6H-3ZM2 0H8V-5H15V-9H20V-3H16V3H9V6H3Z" fill="#101820"/><path d="M-3 -6H3V5H-3Z" fill="#26302e"/>';

const clouds = (prefix, factor = 1) => [
  {id: prefix + '-cloud-a', shape: cloud, state: t => ({x: 210 * factor + Math.round(52 * factor * Math.sin(TAU * t / 8)), y: 24 * factor, scale: factor, opacity: .72})},
  {id: prefix + '-cloud-b', shape: cloud, state: t => ({x: 470 * factor + Math.round(70 * factor * Math.sin(TAU * t / 8 + 1.2)), y: 48 * factor, scale: .72 * factor, opacity: .55})},
];
const driftingLeaves = (prefix, count, positions) => Array.from({length: count}, (_, i) => ({
  id: prefix + '-leaf-' + i, shape: leaf,
  state: t => {
    const p = (t / 8 + i / count) % 1, [x, y] = positions[i % positions.length];
    return {x: x + Math.round(14 * Math.sin(TAU * p + i)), y: y + Math.round(80 * p),
      rotate: Math.round(40 * Math.sin(TAU * p)), scale: .55,
      opacity: p < .12 ? p / .12 : p > .82 ? (1 - p) / .18 : .85};
  },
}));
const embers = (prefix, xs, y) => xs.map((x, i) => ({
  id: prefix + '-ember-' + i, shape: rect(-1, -2, 3, 4, '#c9a366'),
  state: t => {
    const p = (t / 2 + i * .37) % 1;
    return {x: x + Math.round(3 * Math.sin(TAU * p)), y: y - Math.round(22 * p), opacity: Math.sin(Math.PI * p) * .8};
  },
}));

const scenes = {
  banner: [...clouds('entrance'), ...driftingLeaves('entrance', 4, [[430, 198], [510, 210], [565, 196]])],
  resident: embers('resident', [306, 958], 132),
  stack: [
    ...clouds('stack', 1.25),
    ...driftingLeaves('stack', 6, [[55, 450], [1214, 1220], [65, 1450], [1200, 560]]),
    {id: 'stack-bat', shape: bat, state: t => ({x: 850 + Math.round(90 * Math.sin(TAU * t / 8)), y: 78 + Math.round(16 * Math.cos(TAU * t / 4)), scaleY: .45 + .55 * (.5 + .5 * Math.cos(TAU * t * 2))})},
  ],
  garage: [
    ...Array.from({length: 5}, (_, i) => ({
      id: 'brew-steam-' + i, shape: puff,
      state: t => {
        const p = (t / 4 + i / 5) % 1;
        return {x: 302 + i * 14 + Math.round(8 * Math.sin(TAU * p + i)),
          y: 198 - Math.round(94 * p), scale: .6 + p * .55, opacity: Math.sin(Math.PI * p) * .42};
      },
    })),
    ...embers('brew', [292, 355, 372], 286),
  ],
};

function values(effect, t) {
  return {x: 0, y: 0, scale: 1, scaleY: 1, rotate: 0, opacity: 1, ...effect.state(t)};
}
function transform(v, css) {
  return css
    ? `translate(${v.x}px,${v.y}px) rotate(${v.rotate.toFixed(2)}deg) scale(${v.scale.toFixed(3)},${(v.scale * v.scaleY).toFixed(3)})`
    : `translate(${v.x} ${v.y}) rotate(${v.rotate.toFixed(2)}) scale(${v.scale.toFixed(3)} ${(v.scale * v.scaleY).toFixed(3)})`;
}
export function atmosphereCSS(scene) {
  return scenes[scene].map(effect => {
    const frames = Array.from({length: 129}, (_, i) => {
      const v = values(effect, i / 16);
      return `${(i * 100 / 128).toFixed(3)}%{transform:${transform(v, true)};opacity:${v.opacity.toFixed(3)}}`;
    }).join('');
    return `@keyframes ${effect.id}{${frames}}.${effect.id}{animation:${effect.id} 8s steps(1,end) infinite}`;
  }).join('');
}
export function atmosphere(scene, t, animated = false) {
  return '<g shape-rendering="crispEdges">' + scenes[scene].map(effect => {
    const v = values(effect, t);
    return `<g class="${animated ? effect.id : ''}" transform="${transform(v, false)}" opacity="${v.opacity.toFixed(3)}">${effect.shape}</g>`;
  }).join('') + '</g>';
}
export function flatMoon(x, y, size = 1) {
  // A flat stepped disc with pixel craters. No perspective faces or shaded sides.
  return `<g transform="translate(${x} ${y}) scale(${size})" shape-rendering="crispEdges"><path d="M-8 -20H8V-17H14V-12H18V-6H20V6H18V12H14V17H8V20H-8V17H-14V12H-18V6H-20V-6H-18V-12H-14V-17H-8Z" fill="#bbc3c4"/>${rect(-10,-10,8,6,'#929fa6')}${rect(2,-15,6,5,'#d0d6d3')}${rect(3,3,9,7,'#9da9ad')}${rect(-10,7,6,5,'#a3afb2')}</g>`;
}
