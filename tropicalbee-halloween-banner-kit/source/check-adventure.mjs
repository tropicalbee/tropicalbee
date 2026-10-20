import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pages, rooms} from './adventure.mjs';

const states = new Map(pages.map(p => [p.id, p]));
assert.equal(states.size, pages.length, 'Page IDs must be unique');
const endings = new Set();
const seen = new Set();
const pending = ['start'];
const repairs = new Map([
  ['valves', ['moonseed', 'OPEN THE MOON VALVE']],
  ['fuses', ['coil', 'AMBER - BLUE - GREEN']],
  ['circuit', ['lantern', 'SOCKET - GEAR - PRISM']],
  ['bearing', ['aligned', 'SET NORTH']],
  ['beacon', ['restored', 'SEED - COIL - LANTERN']],
]);
while (pending.length) {
  const id = pending.pop();
  if (seen.has(id)) continue;
  const p = states.get(id);
  assert(p, `Missing target: ${id}`);
  seen.add(id);
  if (p.ending) endings.add(p.ending);
  assert(p.choices.length || p.ending, `${id} is an unfinished dead end`);
  assert.equal(p.key, p.seals >= 1, `${id}: key and first seal disagree`);
  assert(p.seals >= 0 && p.seals <= 2);
  if (p.room.startsWith('attic')) assert(p.key, `${id}: entered attic without the key`);
  if (p.room === 'garden') assert.equal(p.seals, 2, `${id}: exited before solving the bells`);
  if (p.room === 'attic-cat') assert(p.cat);
  assert(rooms[p.room], `${id}: unknown room`);
  if (p.chapter === 2) {
    assert.equal(p.seals, 2, `${id}: entered the grounds before opening the garden`);
    assert(Number.isInteger(p.progress) && p.progress >= 0 && p.progress <= 5);
    assert.equal(p.equipment.length, p.progress, `${id}: wrong equipment for repair stage`);
    assert.equal(new Set(p.equipment).size, p.equipment.length, `${id}: duplicate equipment`);
    assert.equal(p.journal.length, p.progress + 1, `${id}: incomplete repair journal`);
  }
  for (const [label, target] of p.choices) {
    assert(label.trim(), `${id}: unlabelled control`);
    const next = states.get(target);
    assert(next, `${id}: broken target ${target}`);
    assert(!p.key || next.key, `${id} -> ${target}: lost the key`);
    assert(!p.cat || next.cat, `${id} -> ${target}: lost the cat`);
    assert(next.seals >= p.seals, `${id} -> ${target}: puzzle progress went backwards`);
    const progress = p.progress ?? 0, nextProgress = next.progress ?? 0;
    assert(nextProgress >= progress, `${id} -> ${target}: lost a completed repair`);
    for (const item of p.equipment ?? []) {
      assert(next.equipment?.includes(item), `${id} -> ${target}: lost ${item}`);
    }
    if (nextProgress > progress) {
      assert.equal(nextProgress, progress + 1, 'A repair must not skip a stage');
      const repair = repairs.get(id.replace(/-cat$/, ''));
      assert(repair, `${id} grants equipment without a puzzle`);
      assert.equal(target.replace(/-cat$/, ''), repair[0]);
      assert.equal(label, repair[1], 'An incorrect answer must not grant repair progress');
    }
    if (!p.key && next.key) assert.equal(target, 'key', 'Only the chest awards the key');
    if (!p.cat && next.cat) assert.equal(target, 'cat-key', 'Only befriending the cat awards a companion');
    if (next.seals > p.seals && next.seals === 2) {
      assert(['bells', 'bells-cat'].includes(id));
      assert.equal(label, 'RING THE LEAF', 'Only the correct bell opens the gate');
    }
    pending.push(target);
  }
}
assert.equal(seen.size, pages.length, 'Every page must be reachable from the entrance');
assert.deepEqual([...endings].sort(), ['company', 'escape', 'familiar', 'lantern-road', 'nightkeeper', 'resident']);

// Every state can reach a complete ending without restarting.
for (const p of pages) {
  const queue = [p.id], visited = new Set();
  let canFinish = false;
  while (queue.length) {
    const id = queue.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    const next = states.get(id);
    if (next.ending) { canFinish = true; break; }
    queue.push(...next.choices.map(c => c[1]));
  }
  assert(canFinish, `${p.id} traps the player in a loop`);
}

function play(route, ending) {
  for (let i = 1; i < route.length; i++) {
    assert(states.get(route[i - 1]).choices.some(c => c[1] === route[i]), `Invalid walkthrough step ${route[i]}`);
  }
  assert.equal(states.get(route.at(-1)).ending, ending);
}
play(['start', 'foyer', 'locked', 'study', 'wrong', 'study', 'key', 'attic', 'bells', 'wrong-bell', 'bells', 'gate', 'escape'], 'escape');
play(['start', 'foyer', 'cat'], 'familiar');
play(['start', 'foyer', 'study', 'key', 'attic', 'tea'], 'resident');
play(['start', 'foyer', 'study', 'key', 'cat-key', 'foyer-cat', 'study-cat', 'attic-cat', 'bells-cat', 'wrong-bell-cat', 'bells-cat', 'gate-cat', 'escape-cat'], 'company');
play(['start', 'foyer', 'study', 'key', 'cat-key', 'attic-cat', 'bells-cat', 'gate-cat', 'tea-open-cat'], 'resident');
assert.equal(states.get('escape').cat, false);
assert.equal(states.get('escape-cat').cat, true);
assert.equal(states.get('tea-open-cat').seals, 2);

// Walk both extended routes, including every retry and optional discovery.
const extendedRoute = [
  'trail', 'notice', 'greenhouse', 'seed-drawer', 'botanist', 'valves',
  'wrong-water', 'botanist', 'valves', 'moonseed', 'pipe-note', 'cellar',
  'cellar-shelf', 'cellar', 'pump-chart', 'fuses', 'wrong-fuses', 'fuses',
  'coil', 'repair-log', 'workshop', 'letter', 'circuit-plan', 'circuit',
  'wrong-circuit', 'circuit', 'lantern', 'builders-note', 'observatory',
  'dome-note', 'star-chart', 'bearing', 'wrong-bearing', 'bearing',
  'aligned', 'startup', 'beacon', 'wrong-beacon', 'startup', 'beacon', 'restored',
];
for (const cat of [false, true]) {
  const suffix = cat ? '-cat' : '';
  const entry = ['start', 'foyer', 'study', 'key',
    ...(cat ? ['cat-key'] : []), `attic${suffix}`, `bells${suffix}`, `gate${suffix}`];
  for (const [destination, ending] of [['dawn', 'lantern-road'], ['keeper', 'nightkeeper']]) {
    play([...entry, ...extendedRoute.map(id => id + suffix), destination + suffix], ending);
    const result = states.get(destination + suffix);
    assert.equal(result.progress, 5);
    assert.equal(result.cat, cat);
    assert.deepEqual(result.equipment, ['Moonseed', 'Copper coil', 'Star lantern', 'Sky bearing', 'Beacon restored']);
  }
  assert(states.get(`trail${suffix}`).choices.some(c => c[1] === `gate${suffix}`),
    'Players must be able to choose the short route before starting repairs');
}

for (const room of Object.values(rooms)) {
  await fs.access(fileURLToPath(new URL(`../assets/${room.file}`, import.meta.url)));
}
const readme = await fs.readFile(fileURLToPath(new URL('../../README.md', import.meta.url)), 'utf8');
assert.match(readme, /<a href="tropicalbee-halloween-banner-kit\/game\/start\.md"[^>]*>\s*<picture>/);
assert(!readme.includes('>Enter the house</a>'), 'The duplicate entrance link below the banner must stay removed');
console.log(`PASS: ${pages.length} reachable states, six endings, nine walkthroughs, seven puzzles, equipment and companion continuity, retry paths and banner entry.`);
