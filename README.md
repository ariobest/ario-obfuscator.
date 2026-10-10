# ARIO Obfuscator — Advanced Static GitHub Pages Build

A mobile-friendly, static Lua/Luau transformation workbench. All processing is in the browser; no source code is sent to a server.

## Deploy from your phone

1. Download and extract `ario-obfuscator-advanced.zip`.
2. Create a public repository on GitHub named `ario-obfuscator`.
3. Upload the **contents** of this folder, preserving the `css`, `js`, and `assets` folders. Do not upload only the ZIP.
4. Commit to the `main` branch.
5. Open **Settings → Pages**.
6. Choose **Deploy from a branch**, select `main` and `/(root)`, then Save.
7. After deployment, open `https://YOUR-USERNAME.github.io/ario-obfuscator/`.

If GitHub's mobile UI hides the Pages menu, use your browser's **Desktop site** option.

## Project layout

- `index.html` — app structure
- `css/styles.css` — responsive dark-blue interface
- `js/lexer.js` — conservative tokenization
- `js/transform.js` — string/numeric/comment/minification and experimental renaming transforms
- `js/app.js` — editor UI, import/export, profiles, report, settings JSON
- `assets/favicon.svg` — favicon

## Limitations and safety

This is more than a static mockup, but it is **not** a full Lua/Luau parser, compiler, or virtual-machine obfuscator. Identifier renaming is experimental and may break shadowed locals, table keys, parameters, debug/reflection uses, and dialect-specific syntax. String handling is not a complete implementation of every Lua escape sequence. Test carefully against your exact runtime and keep the original source.

No obfuscator can promise code is impossible to reverse. This project does not implement VM virtualization, anti-tamper, or a server-side build engine. GitHub Pages only hosts static files; a server-side engine would need a separate backend. Never put API keys or server secrets into distributed client-side code.
