# Shin Cabinet — Minimal Personal Portfolio V8

A static Cloudflare Workers website for furry art, original characters, and commission information.

## Design direction

V8 keeps the same minimal direction and adds a dedicated Adoptable page in the main navigation. V6 moved the site away from a modern startup/portfolio landing page and toward a much plainer personal artist site:

- warm off-white background
- mascot icon + wordmark in the header
- simple gray navigation
- large conversational homepage introduction
- character art as the main homepage visual
- no homepage feature cards, sales blocks, gradients, or decorative hero shapes
- gallery and character pages led by images with very little surrounding UI
- commissions presented as a catalogue rather than promotional pricing cards
- one consistent visual language across every page
- Adoptable page for available character designs
- Additional Info → TOS / Contacts dropdown
- transparent Shin chibi face in the header/favicon

The Fursuits page and build log remain disabled because there is no finished fursuit portfolio yet.

## Edit the site

- Page visibility and hierarchy: `config/pages.js`
- Main text, characters, artwork, adoptables, pricing, and links: `assets/js/content.js`
- Contact/social directory: `assets/js/content.js` → `site.contacts`
  - Contact links may set `display` separately from `url`, e.g. `{ label: "Discord", display: "@username", url: "https://discord.com/users/123..." }`.
- Draft content for generic pages: `config/custom-pages.js`
- Visual design: `assets/css/styles.css`

A copy of the previous V5 stylesheet is kept at `assets/css/styles.v5-backup.css`.

## Add an adoptable

Put the design image in `assets/images/adoptables/`, then add an entry to the `adoptables` array in `assets/js/content.js`:

```js
{
  id: "design-name",
  name: "Design Name",
  price: "$60",
  status: "Available",
  image: "/assets/images/adoptables/design-name.webp",
  description: "Short description.",
  url: "https://your-sale-page.example"
}
```

Leave the array empty and the page will simply show that no adoptables are currently available.

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

## Image asset workflow

The site now uses **one canonical file per piece of artwork whenever possible**. Do not make separate thumbnail, profile, homepage, or commission copies of the same image. The browser scales the canonical file for each use.

Important shared files:

- `assets/images/branding/shin-chibi-header.png` — header mark **and** browser/manifest icon. Replace this one file to update the site branding everywhere.
- `assets/images/gallery/full/shin-chibi-pose.webp` — Shin homepage art, character directory/profile art, Gallery entry, build-log reference, and chibi full-body commission example.
- `assets/images/gallery/full/shin-character-card.webp` — Gallery entry, Shin reference image, build-log target, and character-card commission example.
- `assets/images/gallery/full/michiru-chibi-icon.webp` — Gallery entry and chibi-icon commission example.

The old `gallery/thumbs/` copies and duplicated commission/character copies were removed. For new Gallery entries, set only `image`. The site already uses `image` as the dialog/full-size fallback. Add a separate `full` property only when you deliberately want two different files.

Image responses are set to `max-age=0, must-revalidate` in `_headers`. The Site Manager can replace canonical files directly and automatically bumps existing `?v=N` cache-bust values so a replacement appears immediately. If a replacement changes file format, the manager updates every matching image path across the site to the new extension.

Transparent pixels in the header mark are backed by the site's `--bg` color in `styles.css`.

## Light / dark mode

A **floating pill theme toggle** stays fixed in the bottom-right corner of the site. The visitor's choice is saved in `localStorage` under `shin-theme`. If they have never chosen a theme, the site starts from their operating-system/browser color preference.

Theme colors live at the top of `assets/css/styles.css`:

- `:root` contains the light palette.
- `html[data-theme="dark"]` contains the dark palette.
- The dark background currently uses `#21201C`.

Change those variables if you want to adjust either theme; no individual page edits are needed.

## Dedicated character pages

The Characters directory still uses the same image/gallery setup as before, but clicking a character now opens an internal profile page instead of using Toyhou.se as the main profile.

Character information remains in:

```text
assets/js/content.js
```

A character can now include these optional profile fields:

- `path` — internal URL, such as `/characters/shin/`
- `profileImage` — optional larger header image; omit it to reuse `image` automatically
- `tagline` and multi-paragraph `bio`
- `facts`
- named `palette` swatches; clicking a swatch copies its hex value
- `designNotes`
- `personality`
- `likes` / `dislikes`
- `references`
- optional external `links`

Empty sections are hidden automatically.

The profile also automatically shows existing Gallery entries whose `character` field exactly matches the character name, so you do **not** need a second artwork list or a new image workflow.

### Add another character profile

Use **Characters → New character** in the Local Site Manager. Saving a new character automatically creates `characters/<id>/index.html`, updates the content configuration, and regenerates the sitemap. You can keep the character unpublished until it is ready.

Character profiles reuse the same canonical Gallery image by default, so no duplicate character image is required.

## Local Site Manager GUI

For normal content changes, use the local GUI instead of editing the JavaScript files by hand.

```bash
./tools/site-manager.sh
```

or:

```bash
python3 tools/site_manager.py
```

The manager opens at `http://127.0.0.1:8765/__manager__/` and also serves a live local preview at `http://127.0.0.1:8765/`.

The GUI can:

- add and edit character profiles;
- publish or hide individual characters;
- automatically create each character's `/characters/<id>/` profile page;
- enable or disable existing site pages;
- control whether pages appear in the navigation, footer, or home cards;
- paste and browse permanent image IDs created by the Raspberry Pi Image Manager;
- change individual image assignments in Gallery entries, commission cards, character fields, and custom-page config without globally repointing the old asset;
- group alternate versions under Gallery and character reference images;
- show how many site references use each image ID/reference and which files contain them;
- link Gallery, character, commission, adoptable, and custom-page slots directly to `https://images.shincabinet.com/...` URLs;
- edit common site-wide text and status values;
- regenerate `sitemap.xml` after page/character visibility changes.

The manager binds to `127.0.0.1` only and uses Python's standard library, so it does not require pip packages. The entire `tools/` directory is excluded by `.assetsignore`, so the manager itself is not published with the website.

### Character visibility

Characters now support an `enabled` field. `enabled: false` keeps the character data and generated profile on disk but removes it from the public character directory and shows an unpublished notice if its direct URL is visited.

## Alternate image versions

Gallery artwork and character reference images can optionally have alternate versions (for example clothing on/off, accessories, censored/uncensored, or expression changes). The Gallery/reference grid still shows only the primary image. When the image is opened, the primary version and its alternates appear in a thumbnail strip below the large preview.

Use the separate Raspberry Pi Image Manager to upload the files, copy each permanent `img_...` ID, then use **Site Manager → Artwork details** to add, remove, or reorder alternatives. Alternative image IDs are also exposed in **Image assignments**.

### Artist credits

Gallery artwork and character reference images can optionally include an artist credit. In **Artwork details**, set **Artist credit** to the artist name/handle and optionally provide **Artist link**. Character reference credits can also be edited directly from **Characters → Reference images**. When a credit exists the public site shows `Art by <artist>` beneath the thumbnail and inside the enlarged artwork viewer; the artist name becomes a link when a URL is supplied. Leave both fields blank for your own work and no credit UI is rendered.

Credits apply to the primary image and all alternate versions in that image set. The content fields are `artist` and `artistUrl` on either a Gallery artwork entry or character reference entry.

The stored shape is optional and backward-compatible:

```json
"alternatives": [
  {
    "title": "Jacket off",
    "image": "https://images.shincabinet.com/characters/example/reference/jacket-off.webp",
    "alt": "Character without the jacket"
  }
]
```


## Remote image host

Artwork storage is intentionally separate from this GitHub repository. The Raspberry Pi image manager owns the physical files and the ID-to-file registry under `/mnt/storage/shincabinet-images`, while this website stores only permanent image IDs and metadata.

Preferred new references look like:

```text
https://images.shincabinet.com/gallery/example/primary.webp
https://images.shincabinet.com/characters/shinji/reference/main.png
```

Use the separate `images.shincabinet.com-pimb4` Image Manager to upload, rename, move, or delete files. Copy the public URL from that manager and paste it into this Site Manager's character, artwork-detail, or image-assignment fields. The website Site Manager never writes new artwork into `assets/images/`.

### Legacy migration

Existing `/assets/images/...` references remain supported while the old repository artwork is migrated. If **Map legacy /assets/images paths to image host** is enabled, this:

```text
/assets/images/gallery/full/example.webp
```

is served from:

```text
https://images.shincabinet.com/gallery/full/example.webp
```

Do not enable that legacy mapping until the corresponding files are present on the Raspberry Pi. New direct `https://images.shincabinet.com/...` references work whether the legacy switch is on or off.

The long-term target is for GitHub to contain no portfolio/reference artwork. Static branding assets can also be migrated to the image host once their HTML/manifest references are changed and their remote URLs are verified.

### Maximum served resolution

When **Use Cloudflare image transformations** is enabled, the public site requests a transformed URL bounded by the configured maximum dimension. A setting of `2048` means the served image fits within a `2048 × 2048` box, keeps its aspect ratio, and is never upscaled. The untouched original remains available on `images.shincabinet.com`, and gallery/reference dialogs expose an **Open original image** link.

For example:

```text
https://images.shincabinet.com/cdn-cgi/image/fit=scale-down,width=2048,height=2048,format=auto,onerror=redirect/gallery/example/primary.webp
```

Cloudflare Image Transformations must be enabled for the `shincabinet.com` zone. If transformations are disabled or the maximum is `0`, the original remote image is served directly.

## Dynamic image IDs

New remote artwork should be assigned using permanent IDs generated by the Raspberry Pi Image Manager, for example:

```text
img_9f73c215bf6a46b78973b6317dc16c3a
```

Website content keeps the existing `image` field but its value is now preferably an ID:

```javascript
{
  "title": "Bound Shinji",
  "image": "img_9f73c215bf6a46b78973b6317dc16c3a"
}
```

At runtime the site resolves this to:

```text
https://images.shincabinet.com/i/img_9f73c215bf6a46b78973b6317dc16c3a
```

When `maxImageDimension` is set, ID-backed images use the Pi manager's dynamic resized route:

```text
https://images.shincabinet.com/i/img_9f73...?max=2048
```

The original remains available through the same ID without `?max=`. Replacing or moving the backing file in the Pi Image Manager does not require a website commit because the ID is unchanged.

Direct `https://images.shincabinet.com/...` URLs and `/assets/images/...` paths remain supported only to make migration gradual.
