# Minecraft Halloween entrance

The banner uses midnight-blue sky, oak planks, cobblestone, forest green, sandstone lettering and small orange light sources. Its coarse block textures match the latest tech-display art direction. No purple mist, large glowing title or ornate border is used.

## Use

Copy `assets` and `game` into your GitHub profile repository, then insert the snippet from `README.md` above your other sections. The wooden ENTER THE HOUSE sign is inside the image beside the porch. The entire banner is a normal Markdown image link to `game/start.md`; clicking the sign or another part of the image opens the same adventure. An image embedded in a README does not need an internal scripted button for this.

## Motion

The GIF is a verified eight-second loop with 128 frames. One slow bat flies and flaps, a spider descends slightly, and a larger block ghost blinks and gently floats by the porch. Pumpkin openings have a clear two-second light pulse; the orange skins stay still. Lantern and window light cores vary more subtly. Object skins, walls, moon, cat, name and sign stay still. There is no fog layer.

The SVG uses the same motion functions and respects reduced motion. To use it, change the image filename in `README.md` from `.gif` to `.svg`. The included PNG is a still preview.

## Customize

Edit `banner-config.json` for the username, short tagline, sandstone title color, and animation switches. Run `npm install` once, then `npm run render`. All image assets are local and embedded in the SVG. No server, API key or workflow is needed to render or play this starter kit after installation. Creating a different room illustration is separate from rendering the supplied source.

Names support ASCII letters, digits and hyphens. The title scales down to fit. Keep the tagline short. The bitmap font is supplied as code rather than an external font dependency.

Replacing `source/background.png` requires updating positions, light boxes, sign placement, and source dimensions in the renderer. Candle or pumpkin bodies must never be included in flicker regions: the renderer selects only pale-yellow light cores inside each box.

## Adventure

The game is a small linked Markdown exploration puzzle. Visitors follow choices between pages to investigate the house, find a key and reach the ending. Browser Back behaves normally; this is not a stateful arcade game. Room drawings are editable SVGs in `assets`.

This is the entrance section only. The Resident and tech-stack sections are separate assets; this kit does not replace those sections. Nothing has been published or written to GitHub.
