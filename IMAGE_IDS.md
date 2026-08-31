# Image ID workflow

The preferred image value everywhere in manager-owned site configuration is a permanent Raspberry Pi Image Manager ID:

```text
img_9f73c215bf6a46b78973b6317dc16c3a
```

Do not store the physical HDD path in website metadata. Do not store a direct image URL for new content.

The runtime maps the ID through the configured image host:

```text
img_9f73... -> https://images.shincabinet.com/i/img_9f73...
```

With `maxImageDimension: 2048`, normal page images request:

```text
https://images.shincabinet.com/i/img_9f73...?max=2048
```

Artwork dialogs link to the original stable ID URL without `?max=`.

The Site Manager still accepts direct image-host URLs and legacy `/assets/images/...` paths so existing entries can be migrated. Pasting a stable `/i/img_...` URL is canonicalized back to the ID before it is saved.
