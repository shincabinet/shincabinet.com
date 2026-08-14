# Shin Cabinet — Minimal Personal Portfolio V7

A static Cloudflare Workers website for furry art, original characters, and commission information.

## Design direction

V7 keeps the V6 direction and adds a small Additional Info dropdown. V6 moved the site away from a modern startup/portfolio landing page and toward a much plainer personal artist site:

- warm off-white background
- mascot icon + wordmark in the header
- simple gray navigation
- large conversational homepage introduction
- character art as the main homepage visual
- no homepage feature cards, sales blocks, gradients, or decorative hero shapes
- gallery and character pages led by images with very little surrounding UI
- commissions presented as a catalogue rather than promotional pricing cards
- one consistent visual language across every page
- Additional Info → TOS / Contacts dropdown
- transparent Shin chibi face in the header/favicon

The Fursuits page and build log remain disabled because there is no finished fursuit portfolio yet.

## Edit the site

- Page visibility and hierarchy: `config/pages.js`
- Main text, characters, artwork, pricing, and links: `assets/js/content.js`
- Contact/social directory: `assets/js/content.js` → `site.contacts`
- Draft content for generic pages: `config/custom-pages.js`
- Visual design: `assets/css/styles.css`

A copy of the previous V5 stylesheet is kept at `assets/css/styles.v5-backup.css`.

## Enable or disable pages

```bash
python3 tools/manage_pages.py list
python3 tools/manage_pages.py enable about
python3 tools/manage_pages.py disable commissions
```

To publish Fursuits later:

```bash
python3 tools/manage_pages.py enable fursuits
python3 tools/manage_pages.py set fursuits --menu on --footer on
```

## Cloudflare Workers deployment

- Production branch: `main`
- Root directory: blank
- Build command: blank
- Deploy command: `npx wrangler deploy`
