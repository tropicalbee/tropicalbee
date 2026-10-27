# The Trespass Register

![An abandoned cemetery gate. A saved visitor count appears on the wooden sign while footsteps, lantern light and watching eyes animate.](assets/trespass-register.gif)

The sign embeds the saved profile-view count from `data/visitors.json`. The root
README includes an invisible Komarev counter image to record requests between
updates. The workflow refreshes the artwork every 12 hours, at midnight and noon
Asia/Kolkata. The other scene animations stay intact.

Before the first successful fetch, the sign says AWAITING FIRST COUNT. No visitor
number is invented. Failed or decreasing responses preserve the published count.
Counts represent image requests, not unique people; each snapshot fetch itself
also adds a request. GitHub caching and repeated loads affect the total.

Rebuild from the saved snapshot using the existing Sharp installation:

```sh
node trespass-section-kit/source/render-trespasses.mjs
```

Fetch a fresh snapshot first only when network access is intended:

```sh
python trespass-section-kit/source/fetch-visitors.py
```

The eight-second GIF has 100 frames at 1024 by 410. The still PNG is the
reduced-motion alternative; the SVG is editable and animated. Text stays fixed
while footprints, lantern light and eyes move. The source artwork is unchanged.

Keep the shared `scripts/` folder and `garage-section-kit/source/pixel-font.mjs`.
The exact background-generation prompt is in `source/art-prompt.json`.
The artwork is Minecraft-inspired, not an actual screenshot from the game.

Apache 2.0 licensed; see `LICENSE`, `NOTICE` and "Reuse and credit" in the root `SETUP.md`.
