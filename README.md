# Shin Cabinet — Quiet Studio V4

A static Cloudflare Workers website for character art, furry illustration, fursuit work, and commission information.

## What changed in V4

The earlier design used startup-style marketing patterns: oversized slogans, bright department cards, status chips, a marquee, gradients, and a different visual treatment for each page. V4 replaces those with one restrained system based on the artwork:

- warm paper background with a light grain texture
- rust, cream, deep plum, gold, and a small teal accent
- editorial serif headings and plain body copy
- natural artwork proportions instead of aggressive cropping
- consistent page introductions, section headers, lists, and cards
- no marquee, floating labels, neon gradients, giant counters, or fake urgency
- mature gallery entries blurred until deliberately revealed

## Edit the site

- Page visibility and hierarchy: `config/pages.js`
- Main text, characters, artwork, projects, pricing, and links: `assets/js/content.js`
- Draft content for generic pages: `config/custom-pages.js`
- Visual design: `assets/css/styles.css`

## Enable or disable pages

```bash
python3 tools/manage_pages.py list
python3 tools/manage_pages.py enable about
python3 tools/manage_pages.py disable commissions
```

## Add a page

```bash
python3 tools/manage_pages.py create materials /fursuits/materials/ "Materials" --parent fursuits
```

The new page uses `tools/page-template.html` and can be filled through `config/custom-pages.js`.

## Cloudflare Workers deployment

The repository already includes `wrangler.jsonc` and `.assetsignore`.

Cloudflare settings:

- Production branch: `main`
- Root directory: blank
- Build command: blank
- Deploy command: `npx wrangler deploy`

## Before publishing

Update these placeholders in `assets/js/content.js`:

- commission email
- Toyhouse and social links
- commission status
- prices and terms
- character biography and Toyhouse URL

The gallery currently contains supplied artwork, including mature entries. Mature thumbnails are blurred by default, but the full files are still part of the public deployment. Remove any image you do not want publicly hosted.
