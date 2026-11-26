// Hearth Ledger — the hand-in program (Node 22, standard library only).
//
// The site itself is plain static files in app/: an index.html page, a
// stylesheet, and a handful of classic scripts that render the budget pages
// from the household's own figures. Nothing is built, bundled or fetched.
//
// This program hands the site in. It copies app/ and screenshots/ from
// beside this file into the output directory (/output on the grader, or
// whatever MAKEFUN_OUTPUT_DIR names when run locally) and writes
// /output/dossier.json with the make.fun library in vendor/, which is the
// kit's copy, unchanged. The scorer re-builds the dossier from the same
// files with its own copy of that library and expects the two to match byte
// for byte, so this program does nothing cleverer than copy and call it.
//
// Run it locally like this:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own: at most 4 screenshots, each at most
// 256 KiB; at most 993 files and directories in app/, at most 16 MiB of app
// files; the dossier text at most 160 KiB. buildDossier refuses anything
// past them, with its own words, rather than writing a dossier the gate
// would reject.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
