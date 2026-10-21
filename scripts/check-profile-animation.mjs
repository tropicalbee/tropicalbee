import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadSharp} from './profile-render-utils.mjs';

const sharp = loadSharp(import.meta.url);
const root = new URL('../', import.meta.url);
const baseline = JSON.parse(await fs.readFile(new URL('profile-animation-baseline.json', import.meta.url), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let bytes = 0;
let profileBytes = 0;
// Regions describe visible behavior, rather than mirroring renderer formulas.
const regions = {
  banner: {moving: [[190, 15, 420, 58], [620, 60, 160, 85], [720, 180, 90, 85]], still: [[110, 80, 480, 90], [600, 220, 92, 40]]},
  resident: {moving: [[145, 100, 80, 88], [65, 65, 32, 65]], still: [[365, 43, 470, 140]]},
  portrait: {moving: [[145, 100, 80, 88], [65, 65, 32, 65]], still: []},
  stack: {moving: [[230, 20, 530, 75], [1140, 870, 110, 170], [145, 510, 95, 155]], still: [[300, 130, 700, 110], [260, 420, 210, 70], [244, 284, 96, 96], [942, 1449, 96, 96]]},
  garage: {moving: [[155, 210, 95, 130], [275, 100, 135, 115]], still: [[460, 105, 355, 90], [280, 216, 120, 30]]},
};
function changedPixels(a, b, width, [x, y, w, h], threshold = 24) {
  let changed = 0;
  for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) {
    const offset = (row * width + col) * 3;
    if (Math.max(...[0, 1, 2].map(c => Math.abs(a[offset + c] - b[offset + c]))) > threshold) changed++;
  }
  return changed;
}
for (const section of baseline.sections) {
  const filename = fileURLToPath(new URL(section.file, root));
  const metadata = await sharp(filename, {animated: true}).metadata();
  assert.equal(metadata.width, section.width, `${section.name}: width changed`);
  assert.equal(metadata.pageHeight, section.height, `${section.name}: height changed`);
  assert.equal(metadata.pages, section.frames, `${section.name}: frames lost`);
  assert.equal(metadata.loop, section.loop, `${section.name}: repeat setting changed`);
  assert.deepEqual(metadata.delay, section.delay, `${section.name}: timing changed`);
  const frames = [];
  // Non-uniform times avoid repeatedly sampling the same point in a 2s cycle.
  for (const fraction of [0, .17, .34375, .53, .77]) {
    frames.push(await sharp(filename, {page: Math.floor(section.frames * fraction), pages: 1})
      .removeAlpha().raw().toBuffer());
  }
  assert(new Set(frames.map(hash)).size > 1, `${section.name}: animation was flattened`);
  for (const box of regions[section.name]?.moving ?? []) {
    // Muted clouds intentionally have lower contrast than the foreground actors.
    const changing = frames.slice(1).filter(frame => changedPixels(frames[0], frame, section.width, box, 8) > 10);
    assert(changing.length >= 2, `${section.name}: no sustained visible motion in ${box}`);
  }
  for (const box of regions[section.name]?.still ?? []) {
    const maximum = Math.max(...frames.slice(1).map(frame => changedPixels(frames[0], frame, section.width, box)));
    // Permit minor GIF palette noise, but never animation over readable lettering.
    assert(maximum / (box[2] * box[3]) < .005, `${section.name}: lettering/sign moved in ${box} (${maximum} pixels)`);
  }
  const size = (await fs.stat(filename)).size;
  bytes += size;
  if (section.name !== 'portrait') profileBytes += size;
  console.log(`PASS ${section.name}: ${section.frames} frames, ${size.toLocaleString()} bytes; motion and readable regions checked.`);
}
assert(profileBytes < 5 * 1024 * 1024, 'Five profile GIFs exceed the 5 MiB loading budget');
for (const [file, expected] of Object.entries(baseline.preservedFiles)) {
  assert.equal(hash(await fs.readFile(new URL(file, root))), expected, `${file}: mining route changed`);
}
console.log(`PASS: six GIFs retain dimensions, frame counts, exact delays and loops. Mining route unchanged. Five profile GIFs: ${(profileBytes / 1024 / 1024).toFixed(2)} MiB; including portrait: ${bytes.toLocaleString()} bytes.`);
