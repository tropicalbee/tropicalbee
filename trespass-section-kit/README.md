# The Trespass Register

![An abandoned cemetery gate and visitor register. Footprints approach the dark entrance, a lantern flickers, and watching eyes briefly appear.](assets/trespass-register.gif)

A dedicated footer scene for the live **Trespasses recorded** profile-view badge.
The badge belongs immediately below the artwork, as in the root README. The
image contains no invented visitor number. Its animation tells a small story:
someone crosses the gate, but only the footprints and watching eyes are visible.

The scene uses a muted Minecraft-inspired background with native pixel text,
footprints, light masking and eyes. The eight-second GIF has 100 frames. The
still PNG is the reduced-motion alternative; the SVG is editable and animated.
No robot or AI terminal is part of this scene.

Rebuild from the repository root using the existing Sharp installation:

```sh
node trespass-section-kit/source/render-trespasses.mjs
```

Keep the shared `scripts/` folder and `garage-section-kit/source/pixel-font.mjs`.
The exact background-generation prompt is in `source/art-prompt.json`.
The artwork is Minecraft-inspired, not an actual screenshot from the game.
The live counter needs an internet connection and counts requests, not unique
people. It is independent of the nightly contribution workflow.
