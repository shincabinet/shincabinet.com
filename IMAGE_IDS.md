# Image ID workflow

The preferred image value everywhere in manager-owned site configuration is a permanent Raspberry Pi Image Manager ID:

```text
img_9f73c215bf6a46b78973b6317dc16c3a
```

The runtime resolves that ID through the configured image host:

```text
img_9f73... -> https://images.shincabinet.com/i/img_9f73...
```

With `maxImageDimension: 2048`, normal page images request:

```text
https://images.shincabinet.com/i/img_9f73...?max=2048
```

Artwork dialogs link to the untouched original stable ID URL without `?max=`.

## Routing rules

The website deliberately has only three image-reference behaviors:

1. `img_...` IDs resolve through `https://images.shincabinet.com/i/<id>`.
2. Legacy `/assets/images/...` paths stay local on `shincabinet.com` until you explicitly replace them with an ID.
3. Explicit `https://...` image URLs are used exactly as entered.

The website does **not** rewrite legacy local paths to `images.shincabinet.com` and does **not** generate Cloudflare `/cdn-cgi/image/` URLs. This prevents a legacy filename from becoming a remote 404 when the Pi stores that image under a different physical path.

## Migration

Upload/find the artwork in the Raspberry Pi Image Manager, copy its permanent `img_...` ID, then replace the legacy path in Site Manager. You can migrate one image at a time without breaking the remaining local gallery.
