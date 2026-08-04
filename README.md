# Shin Cabinet — Simple Portfolio V5

A static Cloudflare Workers website for furry art, original characters, and commission information.

## Design direction

This version removes most promotional and dashboard-style UI. It uses one consistent layout across the site:

- plain navigation
- a short homepage introduction
- artwork-led gallery cards
- simple character profiles
- straightforward commission pricing and terms
- dark neutral background with restrained rust accents and light grain

The Fursuits page and build log are disabled because there is no finished fursuit portfolio yet. Their files remain available for later.

## Edit the site

- Page visibility and hierarchy: `config/pages.js`
- Main text, characters, artwork, pricing, and links: `assets/js/content.js`
- Draft content for generic pages: `config/custom-pages.js`
- Visual design: `assets/css/styles.css`

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

Add real portfolio entries to the empty `fursuitProjects`, `fursuitServices`, and `fursuitProcess` arrays in `assets/js/content.js` before publishing that page.

## Add a page

```bash
python3 tools/manage_pages.py create page-id /page-path/ "Page Name"
```

Add `--parent parent-id` to nest it below another page. The new page uses `tools/page-template.html` and its content can be added in `config/custom-pages.js`.

## Cloudflare Workers deployment

The repository includes `wrangler.jsonc` and `.assetsignore`.

- Production branch: `main`
- Root directory: blank
- Build command: blank
- Deploy command: `npx wrangler deploy`

## Before publishing

Update `assets/js/content.js` with the final:

- commission email
- Toyhouse and social links
- commission status
- prices and terms
- character biography and Toyhouse URL

Mature gallery thumbnails are blurred by default, but their source files are still publicly hosted. Remove any image you do not want publicly accessible.
