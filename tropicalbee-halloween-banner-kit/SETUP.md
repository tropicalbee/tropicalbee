# Minecraft Halloween entrance

The banner uses midnight-blue sky, oak planks, cobblestone, forest green, sandstone lettering and small orange light sources. Its coarse block textures match the latest tech-display art direction. No purple mist, large glowing title or ornate border is used.

## Use

Copy `assets` and `game` into your GitHub profile repository, then insert the snippet from `README.md` above your other sections. The wooden ENTER THE HOUSE sign is inside the image beside the porch. The entire banner is a normal Markdown image link to `game/start.md`; clicking the sign or another part of the image opens the same adventure. An image embedded in a README does not need an internal scripted button for this.

## Motion

The GIF is an eight-second loop with 128 frames. Two bats fly and flap, flat clouds drift, leaves fall, a spider descends and a block ghost bobs and blinks by the porch. Pumpkin openings have a two-second light pulse; the orange skins stay still. Lantern and window light cores vary more subtly. Walls, the flat pixel moon, cat, name and sign stay still.

The SVG uses the same motion functions and respects reduced motion. To use it, change the image filename in `README.md` from `.gif` to `.svg`. The included PNG is a still preview.

## Customize

Edit `banner-config.json` for the username, short tagline, stone-grey title color, and animation switches. Run `npm install` once, then `npm run render`. Retain the repository's shared `scripts/` folder for rendering. All image assets are local and embedded in the SVG. No server, API key or workflow is needed to render or play this starter kit after installation. Creating a different room illustration is separate from rendering the supplied source.

Names support ASCII letters, digits and hyphens. The title scales down to fit. Keep the tagline short. The bitmap font is supplied as code rather than an external font dependency.

The active source is `source/vanilla-sky-original.png`, normalized to `source/vanilla-background.png` by the root `scripts/render-profile.mjs`. Replacing it requires updating positions, light boxes, sign placement, and source dimensions in the renderer. Candle or pumpkin bodies must never be included in flicker regions: the renderer selects only pale-yellow light cores inside each box.

## Adventure

The game is **The Thirteenth Knock**, a Halloween horror adventure with 96 game states, two chapters, seven puzzles and six endings. Mother Hollow steals her guests' names on October 31. Explore Briar House, escape, or follow the lanterns through the greenhouse, cellar, workshop and observatory to rebuild the beacon ward. The cat companion and collected equipment remain with you on subsequent choices.

The eleven active illustrations are in `assets/adventure/night/`, including open-chest and cat/no-cat variants. Small SVG title/inventory panels and stone controls are in `assets/adventure/ui/`. A collapsible map and ward journal help players follow the longer quest. Earlier illustrations remain in the kit but the game no longer embeds them.

Edit `source/adventure.mjs` for chapter one and the ending guide; edit `source/adventure-expansion.mjs` for chapter two. Run `node source/render-adventure.mjs` to regenerate the pages and interface. `node source/check-adventure.mjs` checks all routes, puzzle rewards, retry paths and inventory rules; `node source/render-adventure.mjs --check` checks that committed pages match their source. Both commands need only Node.

For a playable local preview, run `node source/render-adventure.mjs --preview`, then open the repository's root `preview.html` yourself. Clicking the banner opens the preview game. GitHub uses the Markdown files instead, with no website deployment or JavaScript required.

Each URL encodes one complete state, so bookmarking the page preserves progress and browser Back revisits an earlier state. Restart begins a new run. The ending collection is a spoiler guide, not a saved achievement counter.

This is the entrance section only. The Resident and tech-stack sections are separate assets; this kit does not replace those sections. Nothing has been published or written to GitHub.
