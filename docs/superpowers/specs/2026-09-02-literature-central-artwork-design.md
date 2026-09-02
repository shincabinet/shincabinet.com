# Literature and Central Artwork Design

## Goal

Add first-class hosted literature/fanfic authored in Markdown through Site Manager, centralize character-linked artwork so Gallery and character profiles consume the same records, add linked-character navigation to expanded images, and simplify the presentation/code without disrupting existing features.

## Content architecture

`assets/js/content.js` remains the source of truth. Artwork and literature become centralized collections. Characters no longer own independently rendered reference collections after migration.

### Artwork

Canonical artwork records use:

```json
{
  "id": "shinji-reference",
  "title": "Shinji Reference",
  "type": "reference",
  "category": "reference",
  "image": "img_...",
  "alternatives": [],
  "characters": ["shinji"],
  "subject": "",
  "artist": "",
  "artistUrl": "",
  "year": "2026",
  "description": "",
  "alt": "",
  "mature": false,
  "featured": false,
  "showInGallery": true
}
```

`type` is either `artwork` or `reference`. `characters` contains zero or more character IDs. `subject` is optional display text for art that depicts characters not present in the site's character directory. Existing legacy `character` labels are migrated into `subject` and/or `characters` when possible.

Character-owned `references` are migrated into `artworks` with `type: "reference"`, `characters: [character.id]`, and `showInGallery: false` unless an equivalent Gallery record already exists. The character `references` property is removed after migration.

### Literature

Canonical literature records use:

```json
{
  "id": "rainy-night",
  "title": "Rainy Night",
  "summary": "Short description.",
  "characters": ["shinji", "kite"],
  "author": "Shin",
  "authorUrl": "",
  "coverImage": "",
  "tags": ["fanfic", "slice of life"],
  "mature": false,
  "published": true,
  "body": "# Chapter One\n\nStory text...",
  "path": "/literature/rainy-night/"
}
```

The story body is entered directly in Site Manager using a restricted Markdown dialect. Arbitrary HTML is never interpreted.

## Public site behavior

### Gallery

The Gallery renders central artwork where `showInGallery !== false`. Cards show minimal metadata. Opening an artwork uses the shared media dialog for primary and alternative versions.

The expanded viewer displays linked characters as clickable chips. Each chip points to the character's canonical profile path. If an artwork has no linked site characters, the character-links row is omitted.

### Character profiles

Character profiles query centralized content by character ID:

- References: artwork where `type === "reference"` and `characters` includes the character ID.
- Gallery: artwork where `type !== "reference"` and `characters` includes the character ID.
- Literature: published literature where `characters` includes the character ID.

A section is omitted when its query returns no content. Artwork cards use the same shared card/dialog behavior as the main Gallery. This avoids duplicate records and duplicate dialog logic.

### Literature directory and readers

`/literature/` lists published works with title, summary, linked characters, author, tags, mature marker, and optional cover image.

Each work has `/literature/<id>/`. Site Manager generates the lightweight HTML shell for that path. JavaScript loads the record by `data-literature-id`, sets metadata, and renders a typography-first reader.

Markdown supports headings, paragraphs, bold, italic, links, blockquotes, horizontal rules, ordered/unordered lists, and inline code. Raw HTML is escaped. Link protocols are limited to `http:`, `https:`, `mailto:`, and site-relative paths.

## Site Manager

### Artwork manager

Add a dedicated Artwork section that supports creating, editing, deleting, filtering, and previewing artwork records. Fields include:

- ID/slug
- title
- type (`artwork` / `reference`)
- category
- primary image ID/reference
- alternatives (ordered title/image/alt rows)
- linked characters (multi-select)
- optional subject label
- artist and artist URL
- year
- description
- alt text
- mature
- featured
- show in Gallery

Site Manager continues to store only image IDs/references; physical image upload remains the responsibility of the Raspberry Pi Image Manager.

### Character manager

Remove the character-owned reference repeater after migrating those records to centralized artwork. Character editing remains focused on profile data.

### Literature manager

Add a dedicated Literature section with create/edit/delete. Fields include ID, title, summary, characters multi-select, author, author URL, optional cover image ID, tags, mature, published, and Markdown body. Include a local rendered Markdown preview using the same renderer as the public reader.

### Image assignment compatibility

Legacy image-assignment and migration tooling remains available for existing content, but new artwork/literature cover images should use dynamic `img_...` IDs.

## Presentation cleanup

Keep the restrained existing visual language. Improve hierarchy rather than adding promotional UI:

- Character profiles separate profile information, References, Gallery, Literature, and external links.
- Empty References/Gallery/Literature sections are never rendered.
- Gallery cards have quieter metadata; richer context appears in the expanded dialog.
- Literature uses a narrow reading measure, strong title typography, muted metadata, and minimal controls.
- Site Manager navigation is grouped around Characters, Artwork, Literature, Pages, Image Links, and Settings.

## Compatibility and migration

Existing artwork remains readable while normalized. `character` labels on artwork are preserved as `subject` if they cannot be mapped safely to a current character ID. Existing `references` are migrated once on the supplied repo content rather than dynamically on every page load.

Existing image routing (`img_...`, direct HTTPS, legacy `/assets/images/...`) remains unchanged.

## Testing

Add regression tests covering:

- artwork normalization and reference migration
- character linkage queries
- literature normalization and generated paths
- safe Markdown rendering contract/escaping
- Site Manager artwork/literature save/delete endpoints
- sitemap inclusion of published literature paths
- existing dynamic image routing tests

Run Python unit tests, Python compilation checks, and JavaScript syntax checks before packaging.
