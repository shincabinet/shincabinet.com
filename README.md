# Shin Cabinet — Personal Art, Characters & Literature

Shin Cabinet is a static personal art site for artwork, original characters, literature/fanfic, commission information, adoptables, and supporting pages. The public site is intentionally restrained: artwork and writing are the focus, empty sections disappear, and the same content record can appear in several places without being duplicated.

## Core content model

The editable site data lives in `assets/js/content.js`.

### Characters

Characters contain profile information only: name, species, biography, palette, personality, design notes, links, and a main image reference. Character pages do **not** own duplicate artwork/reference arrays.

Artwork and literature are linked to characters by stable character IDs. A character profile automatically derives and conditionally renders:

- **References** — central artwork records with `type: "reference"` linked to the character.
- **Gallery** — central artwork records with `type: "artwork"` linked to the character.
- **Literature** — published literature records linked to the character.

If a section has no matching content, it is omitted entirely.

### Artwork

All gallery artwork and character reference images live in the central `artworks` collection. A typical record is:

```js
{
  id: "shinji-reference-2026",
  title: "Shinji Reference",
  type: "reference",          // "artwork" or "reference"
  image: "img_0123456789abcdef0123456789abcdef",
  alternatives: [],
  characters: ["shinji"],
  subject: "",
  artist: "",
  artistUrl: "",
  year: "2026",
  description: "",
  alt: "Shinji reference sheet",
  mature: false,
  featured: false,
  showInGallery: true
}
```

One artwork record can therefore appear in the main Gallery, one or more character profiles, and the expanded artwork dialog without copying its metadata.

Expanded artwork dialogs show linked character chips. Clicking a chip opens that character's profile.

### Literature

Literature/fanfic lives in the central `literature` collection and is written directly in the Site Manager using a restricted Markdown-style editor.

```js
{
  id: "rainy-night",
  path: "/literature/rainy-night/",
  title: "Rainy Night",
  summary: "A short description.",
  characters: ["shinji", "kite"],
  author: "Shin",
  authorUrl: "",
  coverImage: "img_0123456789abcdef0123456789abcdef",
  tags: ["fanfic", "slice of life"],
  mature: false,
  published: true,
  body: "# Chapter One\n\nStory text..."
}
```

Published works appear in `/literature/` and on every linked character profile. Saving a work generates its reading page at `/literature/<id>/` and updates the sitemap.

Supported Markdown includes headings, paragraphs, bold, italics, blockquotes, ordered/unordered lists, horizontal rules, inline code, and safe links. Raw HTML is escaped.

## Local Site Manager

For normal content changes, run:

```bash
./tools/site-manager.sh
```

or:

```bash
python3 tools/site_manager.py
```

The manager opens at `http://127.0.0.1:8765/__manager__/` and serves the site preview at `http://127.0.0.1:8765/`.

Main sections are:

- **Characters** — create/edit/hide character profiles and profile metadata.
- **Artwork** — create/edit/delete central gallery/reference records, assign an image ID, manage ordered alternatives, link multiple characters, set credits/year/maturity/featured state, and choose whether an item appears in the main Gallery.
- **Literature** — create/edit/delete stories, link characters, set tags/cover/author metadata, write Markdown, render a live reading preview, and publish/hide works.
- **Pages** — enable/disable pages and navigation/footer visibility.
- **Image assignments** — inspect and repoint image references used elsewhere in site configuration.
- **Image links** — inspect image usage across configuration files.
- **Site settings** — edit shared site text and media settings.

Site Manager writes are atomic and re-read from disk after saving. The local preview disables normal static caching and refreshes when managed files change, so the preview represents what Git will actually see.

The entire `tools/` directory is excluded from deployment by `.assetsignore`.

## Image workflow

Actual artwork files are managed separately by the Raspberry Pi Image Manager. The primary website stores image references/metadata only.

Preferred image values are permanent IDs such as:

```text
img_9f73c215bf6a46b78973b6317dc16c3a
```

At runtime the website resolves this to:

```text
https://images.shincabinet.com/i/img_9f73c215bf6a46b78973b6317dc16c3a
```

Normal page images may request a derivative using `site.media.maxImageDimension`, for example:

```text
https://images.shincabinet.com/i/img_9f73c215bf6a46b78973b6317dc16c3a?max=2048
```

The original remains available through the same stable ID without `?max=`. Replacing or moving the backing file on the Pi leaves the website record unchanged because the ID is permanent.

Legacy `/assets/images/...` paths remain local until explicitly migrated. Explicit HTTPS image URLs are used as entered. The website does not rewrite legacy paths to the Raspberry Pi and does not generate Cloudflare `/cdn-cgi/image/` transformation URLs.

See `IMAGE_IDS.md` for the image routing contract.

### Adding a new gallery/reference image

1. Upload the physical image in the Raspberry Pi Image Manager.
2. Copy its permanent `img_...` ID.
3. Open **Site Manager → Artwork → New artwork**.
4. Choose `Artwork` or `Reference`.
5. Paste the primary image ID and optionally add alternate image IDs.
6. Select every linked character.
7. Set `Show in main Gallery` as desired and save.

References and normal artwork use the same central collection; their `type` determines which character-profile section displays them.

## Literature workflow

1. Open **Site Manager → Literature → New work**.
2. Enter the work ID, title, summary, author/URL, optional cover image ID, tags, and mature/published state.
3. Select every character appearing in the work.
4. Write the story directly in the Markdown editor and check the rendered preview.
5. Save. The manager creates or updates `/literature/<id>/index.html` and `sitemap.xml`.

Use headings such as `# Chapter One` and `# Chapter Two` inside one work when chapters are needed. There is deliberately no separate chapter database.

## Page control

Page visibility and hierarchy live in `config/pages.js` and can also be managed through the GUI.

CLI examples:

```bash
python3 tools/manage_pages.py list
python3 tools/manage_pages.py enable about
python3 tools/manage_pages.py disable commissions
```

Fursuits and its build log remain disabled until there is content to publish.

## Main files

- `assets/js/content.js` — site content, characters, central artwork, literature, commissions, adoptables, contacts, shared settings.
- `assets/js/site.js` — public rendering and relationship lookup logic.
- `assets/js/markdown.js` — restricted literature Markdown renderer.
- `assets/css/styles.css` — complete public visual system including character, artwork-dialog, and literature layouts.
- `config/pages.js` — page/navigation/footer configuration.
- `config/custom-pages.js` — generic page content.
- `tools/site_manager.py` — local manager HTTP/API backend and page generation.
- `tools/site-manager.html` — local manager UI.
- `tools/character-template.html` — generated character profile shell.
- `tools/literature-template.html` — generated literature reading-page shell.

## Light / dark mode

The floating theme control uses `localStorage` key `shin-theme`. Color variables are defined at the top of `assets/css/styles.css` under `:root` and `html[data-theme="dark"]`. The dark background currently uses `#21201C`.

## Deployment

The public site is static and intended for Cloudflare Workers/Pages-style deployment.

- Production branch: `main`
- Root directory: blank
- Build command: blank
- Deploy command: `npx wrangler deploy`

The public CSP allows `https://images.shincabinet.com` for image loading. JavaScript/config/CSS responses are configured to revalidate in `_headers`.

## Tests

Run the complete regression suite with:

```bash
python3 -m unittest discover -s tests -v
```

Useful syntax checks:

```bash
python3 -m py_compile tools/site_manager.py tools/manage_pages.py
node --check assets/js/site.js
node --check assets/js/markdown.js
node --check assets/js/content.js
node --check config/pages.js
node --check config/custom-pages.js
```
