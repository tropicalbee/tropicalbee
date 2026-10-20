# tropicalbee profile setup

The root `README.md` combines all five existing sections: entrance, resident,
tech stack, projects and contribution miner. Their original folder names,
artwork, source files and licenses are preserved.

## Put it on your GitHub profile

1. Use the public repository **`tropicalbee/tropicalbee`**. GitHub displays a
   profile README from a public repository whose name matches the username.
2. Extract the ZIP. Place its contents at the repository root, keeping the five
   kit folders intact. Include the hidden `.github` folder and `.gitignore`.
   Do not put everything inside an extra enclosing folder.
3. Review and commit the files yourself, then push them to the default branch.
   This package has not been published or connected to your account.
4. Open **Actions → Refresh profile contributions → Run workflow**, select the
   default branch, and run it once to verify your repository's configuration.
5. Confirm the run succeeds and saves a `chore(profile): refresh contribution
   animation` commit. The nightly schedule then runs automatically.

See GitHub's [profile README requirements](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

## Midnight update

The workflow is `.github/workflows/refresh-profile.yml`.

| Setting | Value |
| --- | --- |
| Local time | Every night at **00:00 Asia/Kolkata (India Standard Time)** |
| UTC cron | `30 18 * * *` |
| Manual trigger | `workflow_dispatch`, on the default branch |
| Account | `tropicalbee`, from `ghost-miner-kit/miner-config.json` |
| Data | GitHub's public contribution calendar |
| Credentials | Built-in `GITHUB_TOKEN`; no personal token or API key needed |

GitHub may queue scheduled jobs, so midnight is the requested trigger time,
not a guaranteed completion time. Schedules run from the default branch.
GitHub can disable scheduled workflows in public repositories after 60 days
without repository activity; re-enable the workflow in Actions if this occurs.
See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

The job checks local links, fetches and validates the calendar, runs route and
month-label checks, then renders the miner GIF and still previews. Only the
three calendar/route JSON files and three finished miner assets are staged.
The other four illustrations stay pre-rendered, saving daily render time.
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

- All illustrations, room images and fonts are stored in the repository.
- Five GIFs total approximately **2.87 MiB** in this package. Large editable
  SVGs and source images are not loaded by the normal profile view.
- Every section uses the same 1024-pixel display width and its original aspect
  ratio; GitHub constrains images to the available page width.
- The five illustrations form one continuous stack. Margin-free section blocks
  and top-aligned images remove paragraph spacing and image baseline gaps.
- Each picture offers the existing still PNG when the viewer supports the
  `prefers-reduced-motion` media query. Still alternatives are larger than GIFs.
- Alternative text describes every image. The expandable text profile keeps
  the bio and stack readable without relying on pixel lettering.
- The signboard inside the first banner opens the house adventure. The whole
  banner shares that link, including the sign; no separate entrance link is
  shown below the profile. Every game page can return to the root README.
  Projects links to the account's repositories.

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
the profile still loads its original five GIFs. The eleven active adventure
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
node ghost-miner-kit/source/check-route.mjs
node ghost-miner-kit/source/check-labels.mjs
node tropicalbee-halloween-banner-kit/source/check-adventure.mjs
node tropicalbee-halloween-banner-kit/source/render-adventure.mjs --check
```

A full miner rebuild additionally needs FFmpeg and the kit's `sharp` dependency.
The workflow installs the renderer dependency and, when absent, FFmpeg on its
disposable Ubuntu runner. It does not change your local machine.

## Suggested commit checkpoint

One commit is sufficient for this assembled profile. In your existing profile
repository, review `git status` and `git diff`, then run these commands yourself:

```sh
git add -- README.md SETUP.md .gitignore .github/workflows/refresh-profile.yml scripts/check-profile.py tropicalbee-halloween-banner-kit resident-section-kit tech-stack-kit garage-section-kit ghost-miner-kit
git commit -m "feat(profile): assemble haunted profile and schedule midnight refresh"
```

Push using your normal process. Do not stage the ZIP, `preview.html`,
`node_modules`, render `build` directories or local cache files. If you prefer a
review branch, a suitable name is `feat/haunted-profile`; the schedule becomes
active only after the workflow reaches the default branch.
