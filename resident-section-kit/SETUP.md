# The Resident: haunted garage

The room continues the entrance banner's haunted cottage: cold navy shadow, weathered dark oak, cracked stone, heavy cobwebs, a black cat, a spider and carved pumpkin light. The center stays quiet for the two-line bio.

## Shared character

`source/ghost-sprite.mjs` contains the exact ghost body, face, colors and blink function used by the entrance banner. The Resident uses a uniform 2x scale. Keep this character asset when changing the room; do not regenerate a different ghost with the background.

The room background deliberately contains no ghost. The renderer places the shared sprite behind the laptop and then restores the laptop's original pixels as a foreground layer. The viewer sees the plain outer lid; the inner screen faces the ghost. The spider shares the articulated sprite in `../tech-stack-kit/source/spider-sprite.mjs`: it crawls beside the web, pauses, drops on silk and climbs back. Keep both kits when rebuilding.

## Add it

Copy `assets` into your profile repository and use the snippet from `README.md` below the entrance banner. SVG includes animation and reduced-motion support. Use `assets/resident-preview.gif` for GIF or `assets/resident-preview.png` for a still image.

## Bio

The default bio is exactly two lines:

- building something pretty useless in my garage.
- sometimes it even works.

Edit `bioLines` in `resident-config.json`, keeping each line at 54 characters or fewer. Run `npm install` once and `npm run render` after edits. Retain the repository's shared `scripts/` folder. Both heading and bio use the included bitmap font.

For directly editable Markdown text, use `EDITABLE-BIO.md`; it combines the animated left vignette with ordinary text. GitHub supplies the table border in that variant.

## Animation

The eight-second loop has two eye blinks, a bobbing ghost, a descending spider and rising candle embers. The laptop, cat, furniture, title and bio stay still. Candle flame cores and carved pumpkin light pulse; wax and orange skins stay fixed. The `animateEyes`, `animateLights`, `animateGhost`, `animateSpider` and `animateAtmosphere` switches control these effects. SVG respects reduced motion; the GIF plays its saved frames.

## Extend

The room is 1024 by 236 pixels. Replacing the background requires updating light boxes and the laptop foreground clipping path. Keep candle clips above the wax. Change the shared character source only when intentionally updating both the banner and Resident together.

No account API, server or workflow is required for this section. No real name or fixed tech stack is included.

Bio lettering uses the bundled bitmap font, matching the Minecraft heading. Both lines automatically fit the available width.
