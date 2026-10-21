import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadSharp} from './profile-render-utils.mjs';

const sharp = loadSharp(import.meta.url);
const root = new URL('../', import.meta.url);
// Normalize the two panoramic source assets to the existing animation canvas.
// The resident generation has white letterboxing, removed before resizing.
for (const [kit, width, height, trim] of [
  ['tropicalbee-halloween-banner-kit', 1024, 342, false],
  ['resident-section-kit', 1024, 236, true],
]) {
  const original = kit === 'tropicalbee-halloween-banner-kit' ? 'vanilla-sky-original.png' : 'vanilla-original.png';
  let image = sharp(await fs.readFile(new URL(`${kit}/source/${original}`, root)));
  if (trim) image = image.trim({background: '#ffffff', threshold: 12});
  const normalized = await image.png().toBuffer();
  await sharp(normalized).resize(width, height, {fit: 'fill', kernel: 'nearest'})
    .png().toFile(fileURLToPath(new URL(`${kit}/source/vanilla-background.png`, root)));
}

// Keep full-size frame encoders sequential to bound peak memory.
for (const script of [
  'tropicalbee-halloween-banner-kit/source/render-banner.mjs',
  'resident-section-kit/source/render-resident.mjs',
  'tech-stack-kit/source/render-stack.mjs',
  'garage-section-kit/source/render-garage.mjs',
  'ghost-miner-kit/source/render-miner.mjs',
]) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(new URL(script, root))], {
      cwd: fileURLToPath(root), stdio: 'inherit', windowsHide: true,
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(Error(`${script} exited with ${code}`)));
  });
}
