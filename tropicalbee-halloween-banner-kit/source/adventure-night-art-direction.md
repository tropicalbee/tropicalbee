# Halloween build art direction

The user's supplied references set the direction: recognisable Minecraft builds
with Halloween decorations, muted materials and local pumpkin light.

## Visual rules

- Build rooms from legible cube-grid geometry: stone bricks, spruce planks,
  fence posts, stair blocks and glass panes. Keep surfaces broad and simple.
- Use low-resolution material textures with hard nearest-neighbour edges.
  Avoid painted pixel noise, finely bevelled fantasy furniture and glossy brass.
- Keep the ambient light cool and dim. Use desaturated brown, grey stone,
  charcoal blue and a little dark moss green. Reserve orange for carved pumpkin
  openings, a small lantern or a few windows.
- Keep lamp light local. Avoid orange colour washes, bloom, halos, excessive
  reflections, depth of field and cinematic haze.
- Give each room only the props its puzzle needs. Halloween details should be
  readable: cobwebs, carved pumpkins, plain cloth banners and block-built shapes.
  Do not cover every surface in vines, books, candles or decoration.
- Use a standing player's camera and coherent navigable space, without a HUD
  baked into the illustration. The interface is rendered separately.
- Preserve puzzle clues, the key chest and the companion variants. Matched
  states must share their room layout.

## Delivery

New selected art is stored in `assets/adventure/night/`; earlier artwork remains
in place. `adventure.mjs` and `adventure-expansion.mjs` select the active room
assets. Generation and edit prompts are recorded in
`source/adventure-night-art-prompts.json`.

Use the built-in image-generation tool for this art revision. Interface panels
and buttons remain code-native SVGs, with muted stone colours and square bevels.
