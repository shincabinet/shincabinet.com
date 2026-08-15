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

### Header icon
The header uses `assets/images/branding/shin-chibi-header.png` separately from the browser favicon. This prevents an older cached favicon asset from showing in the header. Transparent pixels are explicitly backed by the site's `--bg` color in `styles.css`.

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
- `profileImage` — larger header image; it can reuse any existing site image
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

1. Add the character to the existing `characters` array in `assets/js/content.js`.
2. Give it a unique `id` and `path`, for example `id: "nova"` and `path: "/characters/nova/"`.
3. Copy `characters/shin/index.html` to `characters/nova/index.html`.
4. Change both `data-character-id="shin"` and `data-character-profile="shin"` to `nova`.
5. Optionally add the new URL to `sitemap.xml`.

No changes to the Gallery's thumbnail/full-size setup are required for character profiles.
