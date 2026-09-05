# Connor Hubin Portfolio — Project Guidelines

## Architecture
Plain static HTML/CSS/JS site — no build step, no framework, no package.json. Key shared files: `styles.css` (shared styles), `script.js` (shared behavior, e.g. video autoplay). Every other `*.html` file at the repo root is an independent page, usually with its own embedded `<style>` block (page-specific rules) in addition to the shared `styles.css`.

Deployed via GitHub Pages directly from the `main` branch — there is no CI/build workflow. **Any commit pushed to `main` goes live on connorhubin.com automatically within ~30 seconds.** Do not add a build step or bundler.

## Images: CDN-first, local assets are gitignored
Images are hosted on S3 (`connor-portfolio-4`) behind CloudFront (`https://deovv8pnl76k0.cloudfront.net/...`), **not** committed to git — `assets/` is in `.gitignore`. Every image uses this pattern:
```html
<picture><source srcset="https://deovv8pnl76k0.cloudfront.net/images/<path>"><img src="assets/images/<path>" alt="..." width="W" height="H"></picture>
```
The `<source>` (CDN) always wins in real browsers; the local `assets/...` `<img src>` is just a fallback/dev-preview path. **A local file under `assets/` being missing or an iCloud `.icloud` stub is normal, not a bug** — don't "fix" it by removing the reference.

To add a NEW image: convert to JPEG if needed (`sips -s format jpeg in.heic --out out.jpg`), upload with `aws s3 cp <file> s3://connor-portfolio-4/images/<path>` (AWS CLI already configured), then reference the CloudFront URL + matching local `assets/` path in the HTML. URL-encode spaces in S3 paths as `%20`.

## Git conventions
- **Never use `git add -A` or `git add .`** — this repo has deliberately-untracked working files at the root (an `archive/` folder, audit scripts/reports, a PDF) that must stay untracked. Always `git add <specific file(s)>`.
- Small, focused commits are the norm — one commit per logical fix/change, with a descriptive message, pushed immediately after verifying.
- No PR workflow is required for solo edits — direct commits to `main` are fine and expected.

## Making text/caption edits
Caption and body text live directly inline in each page's HTML (plain `<p>`, `<div class="...-caption">`, `<h1>`/`<h2>` tags) — there is no CMS or separate content/data file. Find the right file by the page's `<title>`/`<h1>` (e.g. the "Paintings" page is `fine-arts-4-detail.html`, "CTE Pack" is `project-a-detail.html` — filenames don't always match the displayed project name). Grep for the visible text to find the exact element before editing.

## Verifying changes
No test suite exists. Verify by loading the page (locally via `file://` or live via the deployed URL) and visually/structurally confirming the change. If Playwright/browser tools are available, prefer using them to check rendering over reasoning from the CSS alone — this codebase has several non-obvious cross-browser quirks (e.g. Safari-only bugs with `aspect-ratio`+`overflow:hidden`, mobile-only flex-collapse bugs) that don't always reproduce in one environment. When testing anything that scrolls on a mobile viewport, use a real mobile device emulation mode (not just a resized viewport) to avoid a false "space-reserving scrollbar" measurement artifact.
