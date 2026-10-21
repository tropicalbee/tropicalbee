# Ghost Miner · working design preview

A Halloween Minecraft contribution animation. This preview uses tropicalbee's public daily GitHub calendar. A custom calculated route moves the familiar Resident ghost through the ore field, mining every active day exactly once before the loop resets.

![Ghost Miner contribution animation](assets/ghost-miner.gif)

## What the picture means

Every tile is one real day. Columns are weeks, rows run Sunday through Saturday, and the five activity levels come directly from GitHub. Slate tiles are inactive days. Copper and amber cubes are active days. Mined ore leaves a lower stone foundation. Mining changes the replay only; the original calendar JSON is retained unchanged.

Plain month captions sit above their week columns, with Mon/Wed/Fri row guides.
An opening month with too few columns for its caption is omitted rather than
crowded against the next caption. In this snapshot, the opening October has
only two columns, so the first caption is November; every October day remains
in the grid. The final October caption appears at the right edge.

The current snapshot has 367 daily cells from 19 October 2025 through 20 October 2026, including 63 active days. This is the date span returned by the public calendar, including its partial weeks. The loop lasts 24 seconds. The route makes only four-neighbour moves, visits valid day cells and clears every active day once.

The ghost starts at the latest active day. The planner compares several complete tours, improves them with segment reversals and short-block relocation, then smooths equally short paths to reduce turns. Ore encountered en route is mined immediately. Planning is deterministic and always keeps the original nearest-first route as a fallback. This heuristic does not claim a provably shortest tour.

For the bundled calendar, travel drops from **122 to 100 steps (18% less)**. Repeated edges drop from **12 to 3**, and immediate turnarounds drop from **6 to 3**. The mining pauses and 24-second loop remain. Other accounts will have different results; the route is recalculated when their calendar is fetched and rendered.

## Reuse and refresh

Requires Node.js 20.9 or newer, Python 3 and `sharp`. Retain the repository's shared `scripts/` folder:

```sh
npm install
npm run check
npm run render
```

Change the username in `miner-config.json`, then fetch and render:

```sh
npm run update
```

The public-calendar fetcher uses Python's standard library and needs no API key. On Windows, use `py source/fetch-calendar.py` if `python3` is unavailable. The fetcher validates dates, counts and levels before replacing the snapshot; it stops if GitHub changes the calendar markup.

For a still design preview:

```sh
node source/render-miner.mjs --preview
```

## Scope of this preview

- `assets/ghost-miner.gif` is the animated replay for a README.
- `assets/ghost-miner-preview.png` is a still showing mining in progress.
- `assets/ghost-miner-preview.svg` is an editable **static frame**, not an animated SVG.
- `data/calendar.json` contains source dates, levels, counts, username and fetch time.
- `data/mining-route.json` records the calculated route, optimisation metrics and mining times.
- `data/route-baseline.json` records the original bundled calendar's nearest-first measurements for comparison.
- `source/check-route.mjs` verifies coverage, adjacency, deterministic planning, route improvement, sparse/dense patterns, empty accounts and invalid-calendar handling.
- `source/check-labels.mjs` checks month spacing across six calendar layouts, including short boundary months.

The assembled profile includes a [scheduled GitHub Actions workflow](../.github/workflows/refresh-profile.yml) that fetches, checks and renders this calendar nightly at 00:00 Asia/Kolkata (18:30 UTC). Once installed on the profile repository's default branch, it saves the updated calendar and finished contribution assets. See the [profile setup guide](../SETUP.md) for activation and manual runs. Nothing has been published from this local folder.

## Art and source

The cave-entrance background was edited with the built-in image-generation tool from the previous room, preserving the Resident palette with much coarser block textures. The ghost uses the exact existing shared sprite. The daily blocks, pickaxe, movement, particles, text and mining counter are code-native. Art direction is recorded in `source/art-direction.md`.

Code is MIT licensed. The animation is a custom mining replay; it does not use Platane/snk's solver or source. This is an unofficial community design and is not affiliated with Minecraft or Mojang.

## Coarse cave revision

The environment is an exposed stepped-rock mineshaft entrance with broken supports, short rails and a wall torch. Ore uses broader pixel clusters. Plain month names start at their week columns, with no visible years or date-range caption. A minimum 8-pixel gap keeps captions separate. If a partial boundary month is too short for a caption, only its caption is omitted; all day cells remain. The current calendar shows both October captions and November.
