# Neon Coast — GTA-style Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/zretcho/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/zretcho/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Coast** turns your photo and a caption into GTA-style poster cover art, entirely offline in the browser. No upload, no account, no build step — open it, add photos, export a PNG to share.

## What it makes

- **Multi-panel posters** — six layouts: Hero + 3, Four grid, Full bleed, Triple strip, Tilted duo (overlapping snapshots) and Comic strip, each with white gutters and a frame like a printed poster.
- **Any photo, cropped your way** — load up to four photos from your machine, put any of them in any panel, and crop each one: drag it right on the cover, scroll to zoom, or use the per-panel zoom and pan sliders. One photo can fill several panels; several photos can share one cover.
- **Vice City grades** — five colour grades (Vice Sunset, Neon Night, Golden Hour, Miami Teal, Noir) with gradient washes, a vignette and seeded film grain.
- **Bold lettering** — the title in Anton capitals with a sunset gradient and a hard outline, a Pacifico script subtitle, and a five-star badge. All type is original; the fonts are SIL OFL files bundled under `app/fonts/`.
- **One-step export** — PNG in the three common post sizes: 1080 × 1080, 1080 × 1350 and 1920 × 1080, plus a "Surprise me" button that randomises layout and grade.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no install, no network requests — every script, font and sample image is a file under `app/`, and your photos never leave your machine.

## How to use it

1. Add photos from your machine (or use the bundled samples, made with an image model for make.fun).
2. Pick a layout and a grade, type your title and subtitle.
3. Click a panel to select it, drag its photo to position it, scroll to zoom.
4. Choose an export size and press **Export PNG**.

## Files

- `app/index.html`, `app/style.css` — the editor page
- `app/src/main.js` — editor wiring: photos, controls, drag-to-pan, export
- `app/src/cover.js` — the cover renderer (preview and export share it)
- `app/src/layouts.js` — the six panel layouts
- `app/src/grades.js` — the five colour grades and the seeded grain
- `app/src/state.js` — editor state and export sizes
- `app/src/shots.js` — deterministic `?shot=` scenes for the screenshots
- `app/fonts/` — Anton and Pacifico under the SIL Open Font License (`OFL.txt`)
- `app/samples/` — two sample photos, made with an image model for make.fun
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `serve.ts` — a tiny static server for trying the app locally
- `screenshots/` — the entry's screenshots (cover first, then the editor)
- `shots.json` — the scenes the screenshots were taken from

## Originality

Everything in this entry is original: no Rockstar Games logo, wordmark, artwork, character or font. The fonts are Anton and Pacifico, both under the SIL Open Font License. The sample photos were made with an image model for make.fun and are free to use.
