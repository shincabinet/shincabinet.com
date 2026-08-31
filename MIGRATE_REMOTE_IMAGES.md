# One-time migration

1. Deploy the updated `images.shincabinet.com-pimb4` code to the Raspberry Pi and restart `shincabinet-image-manager`.
2. Confirm the existing Nginx `/i/` proxy route still points to `127.0.0.1:8090`.
3. Run the website Site Manager.
4. Open **Media library**.
5. Enter the Tailscale Serve URL for the Pi manager and its API token. Click **Save & test**.
6. Click **Auto-match legacy paths**. Any `config/images.js` record whose old `/assets/images/...` path exists on the Pi will be changed to the Pi's permanent `img_...` ID.
7. Resolve any unmatched records manually with **Choose Pi source**.
8. Verify the live preview.
9. Commit `assets/js/content.js`, `config/images.js`, Site Manager changes, and deleted image binaries.

After migration, normal content records contain only `siteimg_...` IDs. Physical filenames and `img_...` IDs are managed through the Media library rather than entered into character/gallery fields.
