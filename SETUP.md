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
- The banner opens the house adventure; all four return links lead to the root
  profile README. Projects links to the account's repositories.

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
