# Minecraft Halloween Tech Stack

![Languages: Python, C++, HTML, CSS. Frameworks: PyTorch, FastAPI, Streamlit, scikit-learn, LangChain, LangGraph. Databases: Firebase, ChromaDB, Supabase. Tools: Git, GitHub, Docker, VS Code, Jupyter. AI Assistants: Codex, Antigravity.](assets/tech-stack.gif)

Five readable category signs, twenty large pixel-art technology sprites, and a
haunted Minecraft forest. The display uses the dark oak, midnight navy, cream
stone and pumpkin-orange palette of the Welcome and Resident sections.

The icons, labels, signs, title, shelves, lanterns and stepped circular moon
stay still. Pumpkin faces flicker; the shared ghost floats and blinks; the
charcoal spider crawls along the shelf, pauses, lowers on silk and climbs back.
Its legs articulate as it moves. Two fixed corner webs attach to beams and posts. Flat clouds
drift, a bat flies overhead and leaves fall along the outer edges.
Pumpkin bodies and all text stay fixed. There is no marquee.

## Embed

Copy `assets/tech-stack.gif` into your profile repository and add:

```md
![Things I build with](assets/tech-stack.gif)
```

Use `assets/tech-stack-preview.png` for a still version. The SVG includes CSS
animation and a reduced-motion rule. The GIF is the dependable animated README
embed; choose the PNG for no movement.

## Customize

Edit the five titles, labels and local `iconPath` values in `stack-config.json`.
The category signs use bold bundled pixel lettering on muted parchment faces.
The two longer categories have two rows of large item frames and one sign each.

| Category | Default items | Available slots |
| --- | --- | --- |
| Languages | Python, C++, HTML, CSS | 4 |
| Frameworks | PyTorch, FastAPI, Streamlit, scikit-learn, LangChain, LangGraph | 6 |
| Databases | Firebase, ChromaDB, Supabase | 3 |
| Tools | Git, GitHub, Docker, VS Code, Jupyter | 6 |
| AI Assistants | Codex, Antigravity | 2 |

Replace an item with your own local PNG or SVG:

```json
{"label": "My tool", "iconPath": "source/pixel-icons/my-tool.png"}
```

Keep labels short. English letters, digits, spaces and `+ & . - ! , ' ?` are
supported. To add more slots, change the layout in `source/render-stack.mjs` and
give that part of the backdrop enough space.

Disable decorations individually with `animateLights`, `animateGhost`,
`animateSpider` and `animateAtmosphere`. Webs always remain anchored; the legacy
`animateCobwebs` setting is no longer used. The loop is eight seconds. Supported
`framesPerSecond` values are 10, 12.5 and 20; the default is 12.5 (100 frames).

## Render

Requires Node.js and Sharp. Retain the repository's shared `scripts/` folder.
Install the declared npm dependency using your preferred workflow, then:

```sh
npm run render
```

For the still PNG and SVGs without GIF encoding:

```sh
node source/render-stack.mjs --preview
```

The individual pixel sprites and full cobweb PNG are already prepared. Their
source atlas is also included. To regenerate those cutouts:

```sh
npm run prepare:sprites
```

The sprites are custom pixel-art interpretations of the technology symbols,
with chunky shapes and flat color clusters. The backdrop and sprites were
generated from the supplied visual references. This kit includes the artwork,
fonts, sprites and renderers locally; no API key, image-generation service or
network request is needed to regenerate it. The common TECH STACK heading is
part of the backdrop; the five category titles and all twenty labels remain
editable in the config.

Each render preserves its own intermediate PNG frames in a separate `build`
directory. The distributed ZIP excludes intermediate frames. No cleanup or
file deletion is performed.

## License

MIT license for the theme and source. Technology names and brand identities
belong to their respective owners. This is an independent community design;
the pixel interpretations are not official brand assets.
