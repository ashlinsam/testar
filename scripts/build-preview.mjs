// Builds a single-page, hash-routed preview of the site into preview-dist/.
// Same components as the real site; only links and file paths differ.
//   npm run preview:build
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const out = join(root, "preview-dist");
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

await build({
  entryPoints: [join(root, "src/preview/main.tsx")],
  bundle: true,
  minify: true,
  // A classic script, not a module: the preview host runs pages in a sandboxed
  // frame, where module scripts are blocked by CORS and the page stays blank.
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  outfile: join(out, "app.js"),
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  logLevel: "warning",
  plugins: [
    {
      name: "aliases",
      setup(b) {
        b.onResolve({ filter: /^@\/lib\/platform$/ }, () => ({ path: join(root, "src/preview/platform.tsx") }));
        // Next.js must never reach the preview bundle
        b.onResolve({ filter: /^next(\/|$)/ }, (a) => ({ errors: [{ text: `${a.importer} imports ${a.path}; use @/lib/platform instead` }] }));
        b.onResolve({ filter: /^@\// }, async (a) => b.resolve("./" + a.path.slice(2), { resolveDir: join(root, "src"), kind: a.kind }));
        b.onResolve({ filter: /^@content\// }, async (a) => b.resolve("./" + a.path.slice(9), { resolveDir: join(root, "content"), kind: a.kind }));
      },
    },
  ],
});

// Tailwind needs to be told where the class names live when run outside Next.
const entry = join(out, "_entry.css");
writeFileSync(entry, `@import "../src/app/globals.css";\n@source "../src";\n@source "../content";\n`);
execFileSync("npx", ["@tailwindcss/cli", "-i", entry, "-o", join(out, "app.css"), "--minify"], { cwd: root, stdio: "ignore" });
rmSync(entry);
writeFileSync(join(out, "app.css"), readFileSync(join(out, "app.css"), "utf8").replaceAll('url("/textures/', 'url("textures/').replaceAll("url(/textures/", "url(textures/"));

for (const d of ["textures", "photos"]) cpSync(join(root, "public", d), join(out, d), { recursive: true });
// The preview host serves .mp3 but not .m4a: convert (needs ffmpeg).
mkdirSync(join(out, "audio"));
for (const f of readdirSync(join(root, "public", "audio"))) {
  const src = join(root, "public", "audio", f);
  // The background songs stay out of the shareable preview.
  if (f === "background") continue;
  if (/\.(m4a|aac)$/i.test(f)) {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-c:a", "libmp3lame", "-b:a", "96k", join(out, "audio", f.replace(/\.(m4a|aac)$/i, ".mp3"))]);
  } else cpSync(src, join(out, "audio", f));
}

writeFileSync(
  join(out, "index.html"),
  `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#2a201b">
<title>21 Tapes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="app.css">
</head>
<body>
<div class="desk" aria-hidden="true"></div>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`,
);
console.log("Preview built in preview-dist/");
