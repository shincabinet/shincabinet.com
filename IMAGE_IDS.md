# Website image IDs

The website now has its own image identity layer.

## Two IDs, two jobs

- `siteimg_<32 hex>` is owned by `shincabinet.com`. Characters, gallery entries, references, commissions, custom pages, and other website content store this ID.
- `img_<32 hex>` is owned by `images.shincabinet.com`. It identifies the physical image on the Raspberry Pi and survives file replacement or moves.

`config/images.js` maps one to the other:

```js
window.SHIN_IMAGES = {
  "version": 1,
  "items": {
    "siteimg_...": {
      "label": "Shinji reference",
      "source": "img_...",
      "alt": "",
      "alternatives": []
    }
  }
};
```

Content should reference only the website ID:

```json
{ "image": "siteimg_..." }
```

This means changing `source` once updates every usage of that website image.

## Replacing a physical image

Use **Media library → Replace file** in Site Manager, or replace the same `img_...` in the Raspberry Pi Image Manager. Both `siteimg_...` and `img_...` remain unchanged.

## Alternatives

Alternatives belong to the `siteimg_...` record in `config/images.js`. They are not copied into every gallery/reference record. Each alternative points to a Pi `img_...` source.

## Legacy migration

Legacy `/assets/images/...` sources can temporarily remain as `source` values in `config/images.js`. Configure the Pi connection in Site Manager and click **Auto-match legacy paths**. The manager compares each legacy path with the Pi catalog and replaces it with its `img_...` ID.

`site.media.remoteImagesEnabled` is enabled during migration so legacy sources can still resolve through `https://images.shincabinet.com` before they are matched.

## Local connection settings

The Site Manager stores the Raspberry Pi Image Manager URL and API token in:

```text
.site-manager.local.json
```

This file is ignored by Git and should never be committed.
