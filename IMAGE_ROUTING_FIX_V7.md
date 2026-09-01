# v7 image-routing fix

This version removes the legacy path-to-remote rewrite that caused existing gallery images to become `images.shincabinet.com/...` 404s.

Image routing is now deterministic:

- `img_<32 hex characters>` → `https://images.shincabinet.com/i/<id>` and optionally `?max=<dimension>`.
- `/assets/images/...` → remains local on the primary website.
- `https://...` → used exactly as entered.

There is no `/cdn-cgi/image/` generation in the primary website anymore.

## Migration

Keep old local image files until their Site Manager assignments have been changed to `img_...` IDs. Once an entry uses an ID and the public `/i/<id>` URL works, the corresponding old local image can be removed later.

## Quick verification

```bash
python3 -m unittest -v tests.test_image_routing
```

The final test also detects any still-referenced legacy image that has been deleted locally before migration.
