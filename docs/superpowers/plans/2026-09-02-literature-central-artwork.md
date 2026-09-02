# Literature and Central Artwork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize artwork/reference records, add hosted Markdown literature, add character linkage in expanded media, and expose complete Artwork/Literature editing through Site Manager.

**Architecture:** Keep `assets/js/content.js` as the canonical site data store. Public rendering uses focused helpers for artwork-character relationships and safe Markdown, while Site Manager normalizes and persists artwork/literature records and generates character/literature page shells. Existing image-ID routing remains unchanged.

**Tech Stack:** Static HTML/CSS/JavaScript, Python 3 stdlib Site Manager server, `unittest` regression tests.

**Spec:** `docs/superpowers/specs/2026-09-02-literature-central-artwork-design.md`

## Global Constraints

- Keep Raspberry Pi Image Manager metadata-free; all website relational metadata lives in `shincabinet.com`.
- Do not store new artwork binaries in this repo.
- Preserve `img_...`, direct HTTPS, and legacy local image routing behavior.
- Character References, Gallery, and Literature sections render only when matching content exists.
- Raw HTML in literature Markdown must be escaped.
- Return a full updated repository ZIP, never a patch file.

---

### Task 1: Central artwork/literature data normalization and migration

**Files:**
- Modify: `assets/js/content.js`
- Modify: `tools/site_manager.py`
- Create: `tests/test_content_models.py`

**Interfaces:**
- Produces: `normalize_artwork(raw, characters) -> dict`, `normalize_literature(raw, characters) -> dict`
- Produces canonical `content.artworks[]` and `content.literature[]` records.

- [ ] Write failing tests for artwork normalization, linked-character IDs, literature paths, and reference migration.
- [ ] Run `python3 -m unittest -v tests.test_content_models` and confirm failures describe missing normalization/migration behavior.
- [ ] Implement normalization helpers and migrate supplied `character.references` into central artwork records without duplicates.
- [ ] Run the model tests and confirm they pass.

### Task 2: Public relationship helpers and shared media dialog

**Files:**
- Modify: `assets/js/site.js`
- Modify: `assets/css/styles.css`
- Create: `tests/test_public_content_contract.py`

**Interfaces:**
- Produces JS helpers `linkedCharacters(item)`, `artworksForCharacter(id, type)`, `literatureForCharacter(id)`, `characterLinksHtml(item)`.
- `openMediaDialog()` renders linked character chips for artwork/reference entries.

- [ ] Write failing source-contract tests asserting centralized relationship helpers and character-link dialog hooks exist.
- [ ] Run `python3 -m unittest -v tests.test_public_content_contract` and confirm failure.
- [ ] Refactor reference/gallery rendering to central artwork records and shared dialog behavior.
- [ ] Add restrained character-chip/dialog CSS.
- [ ] Run tests and `node --check assets/js/site.js`.

### Task 3: Character profile dynamic sections

**Files:**
- Modify: `assets/js/site.js`
- Modify: `assets/css/styles.css`

**Interfaces:**
- Consumes centralized `data.artworks` and `data.literature`.
- Character profile omits empty References, Gallery, and Literature sections.

- [ ] Extend failing public-content tests for section lookup behavior and absence of `character.references` rendering.
- [ ] Run tests and confirm failure.
- [ ] Implement dynamic References/Gallery/Literature sections and cleaner section labels/layout.
- [ ] Run tests and JS syntax check.

### Task 4: Safe Markdown renderer and literature public pages

**Files:**
- Create: `assets/js/markdown.js`
- Create: `literature/index.html`
- Create: `tools/literature-template.html`
- Modify: `assets/js/site.js`
- Modify: `assets/css/styles.css`
- Modify: `config/pages.js`
- Modify: `_headers`
- Modify: `sitemap.xml` through Site Manager generation logic
- Create: `tests/test_markdown_contract.py`

**Interfaces:**
- Produces `window.SHIN_MARKDOWN.render(markdown) -> safe HTML string`.
- Literature reader uses `[data-literature-reader]` and `data-literature-id`.

- [ ] Write failing tests for renderer escaping, supported formatting markers, literature navigation config, and reader template hooks.
- [ ] Run tests and confirm failures.
- [ ] Implement restricted Markdown renderer and literature listing/reader rendering.
- [ ] Add Literature to navigation/page config and reading-page CSS.
- [ ] Run tests and JS syntax checks for both JS files.

### Task 5: Site Manager Artwork CRUD

**Files:**
- Modify: `tools/site_manager.py`
- Modify: `tools/site-manager.html`
- Create: `tests/test_site_manager_content_api.py`

**Interfaces:**
- Adds POST `/api/artwork/save` and `/api/artwork/delete`.
- Artwork editor consumes `state.content.characters` for multi-select character linkage.

- [ ] Write failing handler-level tests for artwork save/update/delete normalization.
- [ ] Run targeted tests and confirm failures.
- [ ] Implement backend endpoints.
- [ ] Implement dedicated Artwork manager UI with create/edit/delete, alternatives, linked characters, preview, and flags.
- [ ] Run tests and HTML embedded-script syntax extraction/check.

### Task 6: Site Manager Literature CRUD and generated readers

**Files:**
- Modify: `tools/site_manager.py`
- Modify: `tools/site-manager.html`
- Modify: `tools/literature-template.html`
- Modify: `sitemap.xml` generation

**Interfaces:**
- Adds POST `/api/literature/save` and `/api/literature/delete`.
- Produces `/literature/<id>/index.html` shells.

- [ ] Extend failing API tests for literature save/update/delete, generated path, and sitemap inclusion.
- [ ] Run tests and confirm failures.
- [ ] Implement backend normalization, generation, deletion, and sitemap handling.
- [ ] Add Literature manager editor with Markdown body and live preview.
- [ ] Run targeted tests and syntax checks.

### Task 7: Remove duplicate character-reference editing and targeted cleanup

**Files:**
- Modify: `tools/site-manager.html`
- Modify: `tools/site_manager.py`
- Modify: `assets/js/site.js`
- Modify: `README.md`
- Modify: `IMAGE_IDS.md`

**Interfaces:**
- Character editor no longer writes `references` arrays.
- Artwork manager is the single editor for references and gallery artwork.

- [ ] Add/extend tests asserting normalized character records do not recreate `references`.
- [ ] Remove obsolete character-reference editor and variant source branch.
- [ ] Consolidate repeated helper logic touched by the feature without unrelated redesign.
- [ ] Document the new content workflow and image-ID usage.
- [ ] Run all tests and syntax checks.

### Task 8: Final migration and full verification

**Files:**
- Modify generated character/literature pages as needed
- Verify all repository files

**Interfaces:**
- Existing content is fully represented by central artworks; literature collection exists even when empty.

- [ ] Run the supplied data migration against the checked-in content and inspect artwork/reference counts.
- [ ] Run `python3 -m unittest discover -v` and require zero failures.
- [ ] Run `python3 -m py_compile tools/site_manager.py tools/manage_pages.py`.
- [ ] Run `node --check assets/js/site.js`, `node --check assets/js/markdown.js`, `node --check assets/js/content.js`, `node --check config/pages.js`, and `node --check config/custom-pages.js`.
- [ ] Start Site Manager with `--no-browser` on a temporary port and smoke-test `/api/state`, `/literature/`, a character profile, and manager HTML.
- [ ] Package the complete repo as a ZIP.
