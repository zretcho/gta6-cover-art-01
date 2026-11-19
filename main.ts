// Neon Coast — the entry program (Node 22, standard library only). It hands
// the app in: it copies this repository's app/ and screenshots/ into the
// output directory and writes dossier.json there with the vendored make.fun
// library, so the sealed scorer can check the entry and the judge can read
// it. It runs twice in grading and both runs must write the same bytes, so
// it copies files as they are and lets buildDossier do all the summarising.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app itself with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's own caps, so a run that would fail the scorer fails here first:
// the dossier text at most 160 KiB, at most 4 screenshots of at most 256 KiB,
// app/ at most 993 files and 48 MiB with no path over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
