# tropicalbee profile setup

The root `README.md` combines six sections: entrance, resident, tech stack,
projects, contribution miner and the Trespass Register. The original five
scenes retain their animation and continuous layout. The separate cemetery
footer embeds a saved visitor count directly in its wooden sign.

Bats fly, leaves fall, ghosts bob, spiders crawl and descend, and pumpkin lights
flicker. The garage contains the original brewer, potion bubbles, steam and
stirring spoon; the robot experiment is no longer part of the scene. The miner
uses readable month captions above week columns and Mon/Wed/Fri row labels.
The opening month caption is omitted when its fragment would crowd the next
month, without removing any contribution days.

## Put it on your GitHub profile

1. Use the public repository **`tropicalbee/tropicalbee`**. GitHub displays a
   profile README from a public repository whose name matches the username.
2. Extract the ZIP. Place its contents at the repository root, keeping the six
   kit folders intact. Include the hidden `.github` folder and `.gitignore`.
   Do not put everything inside an extra enclosing folder.
3. Review and commit the files yourself, then push them to the default branch.
   This package has not been published or connected to your account.
4. Open **Actions → Refresh profile snapshots → Run workflow**, select the
   default branch, and run it once to verify your repository's configuration.
5. Confirm the run succeeds and saves a `chore(profile): refresh profile
   snapshots` commit. The schedules then run automatically.

See GitHub's [profile README requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

## Midnight and noon updates

The workflow is `.github/workflows/refresh-profile.yml`.

| Setting | Value |
| --- | --- |
| Local time | Register at **00:00 and 12:00 Asia/Kolkata (India Standard Time)**; miner at midnight only |
| UTC cron | `30 18 * * *` (midnight) and `30 6 * * *` (noon) |
| Manual trigger | `workflow_dispatch`, on the default branch |
| Account | `tropicalbee`, from `ghost-miner-kit/miner-config.json` |
| Data | GitHub's public contribution calendar and Komarev's profile-view counter |
| Credentials | Built-in `GITHUB_TOKEN`; no personal token or API key needed |

GitHub may queue scheduled jobs, so these are requested trigger times,
not guaranteed completion times. Schedules run from the default branch.
GitHub can disable scheduled workflows in public repositories after 60 days
without repository activity; re-enable the workflow in Actions if this occurs.
See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

The job checks local links, game pages and counter fixtures. At midnight (or on
a manual run), it fetches the public calendar and rebuilds the miner. Every run
fetches a validated visitor snapshot and rebuilds the register GIF, PNG and SVG.
The four other illustrations stay pre-rendered. Only the miner's six generated
files and the register's JSON snapshot and three finished assets are staged.
The original route baseline remains unchanged.

The prepared workflow commits and pushes those generated files when you
install and run it. No Git write commands were run during local preparation.
Repository or organization policy must permit Actions to write contents.
If branch protection rejects the bot's push, adjust your repository policy
yourself or use a pull-request-based update process. The workflow never
force-pushes or rebases; a concurrent user push can fail that run safely.

A failed fetch, test, render or push leaves the published assets in place.
The fetcher deliberately fails if GitHub changes its calendar markup; check
the failed Actions log before updating the parser. The image is a snapshot,
not a live widget.

## Loading and accessibility

- All scene illustrations and room images are stored in the repository.
  An invisible 1 by 1 counter image loads from Komarev;
  the six scenes, saved count and game remain available if the service fails.
- Six GIFs total **3.96 MiB**, within the **5 MiB loading budget** enforced by
  the animation checker. Large editable SVGs and source images are
  not loaded by the normal profile view.
- Every section uses the same 1024-pixel display width and its original aspect
  ratio; GitHub constrains images to the available page width.
- The original five illustrations form one continuous stack. Margin-free section blocks
  and top-aligned images remove paragraph spacing and image baseline gaps.
- Each picture offers the existing still PNG when the viewer supports the
  `prefers-reduced-motion` media query. Still alternatives are larger than GIFs.
- Alternative text describes every image. The expandable text profile keeps
  the bio and stack readable without relying on pixel lettering.
- The signboard inside the first banner opens the house adventure. The whole
  banner shares that link, including the sign; no separate entrance link is
  shown below the profile. Every game page can return to the root README.
  Projects links to the account's repositories.

The **Trespass Register** is a dedicated cemetery checkpoint below the miner.
Footprints appear one by one on the empty path, a lantern flickers, and eyes
briefly watch from the dark gateway. The wooden sign contains the saved number
in pixel lettering, above "Something followed you in."

An invisible `style=pixel` image from
[Komarev's profile views counter](https://github.com/antonkomarev/github-profile-views-counter)
records requests for `tropicalbee` between scheduled updates. Keep this image
in the README; the saved GIF alone cannot record visits. No hosting account,
personal token or extra service needs to be deployed.

This is an approximate image-request count, not unique visitors. GitHub image
caching, repeat loads and previews affect it. Each scheduled snapshot request
also increments the service's count (normally two extra hits per day). The
number in the artwork updates every 12 hours, subject to Actions queue delays.

`trespass-section-kit/data/visitors.json` stores the count and UTC fetch time.
Before the first successful run it contains `null`, and the sign honestly says
AWAITING FIRST COUNT. Run **Actions > Refresh profile snapshots > Run workflow**
after pushing to populate it. Failed, malformed or decreasing responses fail
the job before publishing; the last committed count and images remain visible.
If the counter is deliberately reset, review the saved data before allowing a
lower value. The local checks use fixtures and do not contact Komarev.

Its source, assets and exact generation prompt live in `trespass-section-kit/`.
The 1024 by 410 scene loops for eight seconds at 12.5 FPS. A still PNG provides
the reduced-motion alternative. Rebuild from the saved snapshot with:

```sh
node trespass-section-kit/source/render-trespasses.mjs
```

To fetch a fresh count manually (requires network access and adds one hit), run
`python trespass-section-kit/source/fetch-visitors.py` before rendering.

## The house adventure

**The Thirteenth Knock** is a Halloween horror adventure with 96 game states,
two chapters, seven puzzles and six endings. Each page carries its key,
companion, equipment and puzzle progress. Bookmark a page to resume; Restart
begins again. There is no login, backend, installation or timer.

Briar House appears every October 31. Mother Hollow steals her guests' names
and keeps them in jack-o'-lanterns; Elias, the captive caretaker, can only warn
visitors indirectly. The story uses supernatural dread and implied danger.
The knocking is narrative, not a real-time countdown.

The house offers a shorter escape. Choose **FOLLOW THE LANTERNS** at the garden
gate to attempt a rescue. Explore the greenhouse, flooded cellar, workshop and
observatory to rebuild the beacon ward. Optional notes reveal the failed
Halloween vigil and the invitation that let Mother Hollow inside. A collapsible
map and ward journal track the clues. Both solo and cat-companion routes can
reach the final choice: take the freed names home, or remain as October's keeper.
The six endings include escape, capture, transformation, rescue and sacrifice.

The room artwork is shared across pages, with separate open-chest and cat/no-cat
variants. Only the visited room and small SVG interface assets load during play;
the profile loads six section GIFs plus the invisible counter image. The eleven active adventure
illustrations live in `tropicalbee-halloween-banner-kit/assets/adventure/night/`.
They use dark spruce, grey stone, coarse block textures, cool night shadows and
small pools of pumpkin light. Grey beveled stone controls match the rooms.
Earlier illustrations remain in `assets/adventure/` but are not loaded by the game.

The existing banner already contains its wooden ENTER THE HOUSE sign. Its link
is on the containing image, like the image entry in
[DoomMe](https://github.com/Kuberwastaken/DoomMe). This implementation uses
original artwork and its own story and game states.

Edit `tropicalbee-halloween-banner-kit/source/adventure.mjs` for the house and
ending guide, or `source/adventure-expansion.mjs` in that kit for chapter two.
Regenerate the committed Markdown pages, interface assets and local preview:

```sh
node tropicalbee-halloween-banner-kit/source/render-adventure.mjs --preview
```

Open `preview.html` yourself and click the signboard. Its local link opens a
playable HTML preview with all choices. The preview files are ignored by Git;
GitHub uses the committed Markdown pages directly. No browser was launched
during preparation. Do not substitute a local preview URL in the root README.

The built-in image-generation tool produced the room illustrations. These are
generated Minecraft-inspired scenes, not captures from Minecraft. The current
direction and exact prompts are in `source/adventure-night-art-direction.md`
and `source/adventure-night-art-prompts.json` inside the banner kit. Earlier
prompt sets remain alongside them. You do not need image generation, an API key
or npm dependencies to regenerate the game's interface.

`preview.html` is an optional local visual preview. Open it yourself after
extracting the package. It approximates GitHub's content width; GitHub's actual
rendering is authoritative. It is ignored by Git and not required for the profile.

## Edit and verify

Edit each kit's JSON configuration for text or animation changes, then follow
its own setup instructions to regenerate that section. If you change the bio
or stack, also update its alternative text and text description in `README.md`.

These checks need only Python and Node, with no package installation:

```sh
python scripts/check-profile.py
python scripts/check-visitor-counter.py
node scripts/check-visitor-label.mjs
node ghost-miner-kit/source/check-route.mjs
node ghost-miner-kit/source/check-labels.mjs
node tropicalbee-halloween-banner-kit/source/check-adventure.mjs
node tropicalbee-halloween-banner-kit/source/render-adventure.mjs --check
```

The animated profile renderer needs the existing `sharp` dependency. One local
installation in the banner kit can serve all six kits:

```sh
npm install --prefix tropicalbee-halloween-banner-kit --no-package-lock --no-audit --no-fund
node scripts/render-profile.mjs
node scripts/check-profile-animation.mjs
node scripts/check-scene-geometry.mjs
```

`render-profile.mjs` rebuilds all six scenes sequentially. The animation check
compares their dimensions, frame counts, individual frame delays and loop
settings with the pre-restyle baseline, checks visible motion in individual
scene regions, and checks that signs and lettering remain still. The mining
route is unchanged; the other scenes deliberately move more. Five scenes loop in
8 seconds; the miner retains its 24-second loop. The resident portrait is also
preserved. If you intentionally change timing later, review the baseline too.

The original five backdrops are normalized to each kit's `source/vanilla-background.png`.
The banner and stack use `source/vanilla-sky-original.png`, with the moon and
clouds drawn as flat pixel layers. The garage uses `source/vanilla-actor-original.png`
so its floating brewer is not duplicated in the backdrop. The resident and
miner use `source/vanilla-original.png`. The resident source has white
letterboxing; the full renderer trims that before placing the animated layers.
Earlier source artwork is retained. The art has simpler block construction,
coarse textures, muted spruce/stone, and small light cores instead of broad glow.
It is generated Minecraft-inspired artwork, not an actual game capture.
Exact restyling prompts are in `scripts/profile-art-prompts.json`.
The sky and brewer cleanup prompts are in `scripts/profile-motion-art-prompts.json`.
Shared cloud, leaf, ember, steam and spoon animations live in
`scripts/profile-motion.mjs`; kit configs let you disable atmospheric motion.

Sharp now encodes GIFs as well as PNG/SVG frames, so FFmpeg is no longer needed.
The scheduled workflow installs Sharp in the banner kit on its disposable runner
and uses the same shared renderer helper. Keep the `scripts/` directory when
uploading the assembled profile. Rendering the full-size tech stack can use
around 1 GiB of memory; render the sections sequentially.
