import {createRequire} from 'node:module';
import path from 'node:path';

// A kit's own dependency wins. The assembled profile can share the banner install.
export function loadSharp(caller) {
  const require = createRequire(caller);
  if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) {
    return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'sharp'));
  }
  let resolved;
  try {
    resolved = require.resolve('sharp');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    resolved = createRequire(new URL('../tropicalbee-halloween-banner-kit/package.json', import.meta.url))
      .resolve('sharp');
  }
  return require(resolved);
}

// Use the existing Sharp dependency for GIF encoding as well as frame rendering.
// Read one frame at a time into one allocation; no second full-frame concatenation.
export async function encodeGifFrames(sharp, {directory, output, width, height, frames, fps}) {
  const frameBytes = width * height * 3;
  const pixels = Buffer.allocUnsafe(frameBytes * frames);
  for (let i = 0; i < frames; i++) {
    const file = path.join(directory, `frame-${String(i).padStart(4, '0')}.png`);
    const {data, info} = await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject: true});
    if (info.width !== width || info.height !== height || info.channels !== 3) {
      throw Error(`Unexpected frame dimensions: ${file}`);
    }
    data.copy(pixels, i * frameBytes);
  }
  await sharp(pixels, {
    raw: {width, height: height * frames, channels: 3, pageHeight: height},
    limitInputPixels: false,
  }).gif({
    loop: 0,
    delay: Array.from({length: frames}, () => 1000 / fps),
    colours: 256,
    dither: 0,
    effort: 4,
    interFrameMaxError: 0,
    interPaletteMaxError: 256,
    keepDuplicateFrames: true,
  }).toFile(output);
}
