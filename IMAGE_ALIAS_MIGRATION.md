# Image alias migration

The public site now requests website-owned IDs directly:

```text
siteimg_... -> https://images.shincabinet.com/s/siteimg_...
```

The Raspberry Pi Image Manager owns the live mapping from that `siteimg_...` alias to its current `img_...` image.

## After deploying the updated Pi manager

1. Run `sudo ./scripts/install-nginx-dynamic-route.sh` on the Pi. This upgrades the existing Nginx dynamic block to proxy both `/i/` and `/s/`.
2. Restart `shincabinet-image-manager`.
3. Start the website Site Manager.
4. Open **Media library** and configure the Tailscale Image Manager URL/API token if needed.
5. Click **Sync / auto-match image aliases** once.

The sync uses exact relative paths first and then a unique-filename fallback. It converts matching legacy sources to `img_...` and registers every primary/alternative `siteimg_...` alias on the Pi.

After this, replacing or repointing a Media library item updates the live image behind `/s/siteimg_...` without changing character/gallery content records.
