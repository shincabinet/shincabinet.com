# Shin Cabinet V3 — configurable Cloudflare Pages portfolio

A dependency-free static website for characters, furry artwork, fursuit projects, fabrication studies, and commissions.

V3 adds a centralized page registry. Pages can be published, hidden from navigation, nested under other pages, or disabled without deleting their HTML or content.

## The three files you will edit most

```text
config/pages.js          Page hierarchy, page switches, navigation and metadata
config/custom-pages.js   Content for generic pages and saved drafts
assets/js/content.js     Characters, artwork, fursuit projects, prices and site identity
```

## Enable or disable a page

Open:

```text
config/pages.js
```

Every page has these controls:

```javascript
{
  "id": "about",
  "label": "About",
  "path": "/about/",
  "enabled": false,
  "menu": true,
  "footer": true,
  "homeCard": {
    "show": false
  }
}
```

The flags mean:

- `enabled: true` publishes the page.
- `enabled: false` keeps the files and content but displays a closed-page notice.
- `menu: true` includes an enabled page in the header navigation.
- `menu: false` creates an enabled but unlisted page.
- `footer: true` includes it in the footer.
- `homeCard.show: true` includes it in the homepage department grid.

Change a flag, commit it, and push. Cloudflare Pages will redeploy the site.

### Disabled-page behavior

At the top of `config/pages.js`:

```javascript
"disabledBehavior": "notice"
```

Supported values:

- `notice` displays a branded “drawer closed” page.
- `redirect` sends the visitor to `disabledRedirect`.

## Page hierarchy

Place a page inside another page's `children` array:

```javascript
{
  "id": "fursuits",
  "label": "Fursuits",
  "path": "/fursuits/",
  "enabled": true,
  "children": [
    {
      "id": "build-log",
      "label": "Build Log",
      "path": "/fursuits/build-log/",
      "enabled": true,
      "children": []
    }
  ]
}
```

Enabled children automatically appear in a dropdown under the parent. If a parent is disabled, every child under it is also treated as disabled, even if a child says `enabled: true`.

## Included draft-page examples

Two generic pages are included but disabled:

```text
/about/
/fursuits/build-log/
```

Their content remains in `config/custom-pages.js`. Flip their `enabled` values to `true` to publish them.

## Manage pages from the command line

The optional helper script makes common changes without editing the hierarchy manually.

List the hierarchy:

```bash
python3 tools/manage_pages.py list
```

Enable or disable a page:

```bash
python3 tools/manage_pages.py enable about
python3 tools/manage_pages.py disable commissions
```

Create a disabled generic page under Fursuits:

```bash
python3 tools/manage_pages.py create materials /fursuits/materials/ "Materials" --parent fursuits
```

Create and publish it immediately:

```bash
python3 tools/manage_pages.py create materials /fursuits/materials/ "Materials" --parent fursuits --enabled --footer
```

Move a page:

```bash
python3 tools/manage_pages.py move materials --parent root
```

Change where a page appears:

```bash
python3 tools/manage_pages.py set materials --menu on --footer on --home on
```

Regenerate the sitemap after manual changes:

```bash
python3 tools/manage_pages.py sync
```

The script automatically updates `sitemap.xml` whenever it creates, moves, enables, disables, or edits a page.

## Add a generic page manually

1. Copy `tools/page-template.html` into a new directory as `index.html`.
2. Replace `{{PAGE_ID}}` in the copied file with a unique page ID.
3. Add that ID and path to `config/pages.js`.
4. Add a matching content object to `config/custom-pages.js`.

Example folder:

```text
fursuits/materials/index.html
```

The generic HTML shell does not contain page-specific content. Its hero and sections are generated from `config/custom-pages.js`.

## Generic content blocks

A generic page can contain any number of these section types:

```text
text
cards
gallery
timeline
links
callout
```

The supplied About and Build Log drafts demonstrate the formats. Copy those objects and replace the text rather than writing new HTML.

## Existing specialized pages

These retain their purpose-built layouts and pull their data from `assets/js/content.js`:

```text
/characters/
/gallery/
/fursuits/
/commissions/
```

Disabling one does not delete its page or data.

## Important limitation

The disabled-page switch is publication control, not secret storage. This is a static website, so committed HTML, JavaScript and images are still present in the deployed files and may be discoverable by someone deliberately inspecting the site.

Do not place private client information, home addresses, passwords, unpublished NDA work, or other sensitive material in disabled pages. Keep truly private work outside the public deployment or protect it with Cloudflare Access.

## Site URL and sitemap

Set the real domain in `config/pages.js`:

```javascript
"siteUrl": "https://shincabinet.com"
```

Then run:

```bash
python3 tools/manage_pages.py sync
```

## Edit the portfolio content

Open:

```text
assets/js/content.js
```

This file controls:

- Artist name, handle, email and social links
- Commission and fursuit availability
- Characters and Toyhouse links
- Gallery entries
- Fursuit projects and services
- Commission packages and process

Replace the placeholder art in:

```text
assets/images/characters/
assets/images/gallery/
```

Recommended image exports:

- Full image: WebP or AVIF, around 1800–2400 px on the longest edge
- Thumbnail: around 800–1200 px on the longest edge
- Strip GPS and device metadata before uploading
- Use lowercase filenames with hyphens

## Test locally

Do not open the files directly with `file://`. Start a local server from the repository root:

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Test disabled examples directly:

```text
http://localhost:8080/about/
http://localhost:8080/fursuits/build-log/
```

## Cloudflare Pages deployment

Use:

```text
Production branch: main
Framework preset: None
Build command: exit 0
Build output directory: .
Root directory: leave blank
```

The site runs as plain HTML, CSS and JavaScript. No package manager, framework, database, VPS or home server is required.
