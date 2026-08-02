SHIN CABINET — QUIET STUDIO PATCH

What this changes
- Replaces the dashboard-like homepage with a personal, image-led landing page.
- Removes the loud gradient cover, statistic boxes, marquee, sales-card language, and oversized calls to action.
- Keeps your existing content.js data model and existing art/character image paths.
- Adds a calmer global skin to Characters, Gallery, Fursuits, Commissions, and generic pages.
- Does not copy FishmanWorks; it borrows the restrained pacing, generous whitespace, organic image shapes, and simple navigation.

How to apply
1. Extract this ZIP anywhere.
2. Open a terminal in your cloned Shin Cabinet repository.
3. Run:

   python3 /path/to/shin-cabinet-studio-patch/apply-studio-style.py

4. Preview locally:

   python3 -m http.server 8080

5. Open http://localhost:8080
6. Commit and push:

   git add -A
   git commit -m "Simplify portfolio into quiet studio layout"
   git push origin main

Cloudflare should redeploy automatically after the push.

Important
- Keep editing assets/js/content.js as before.
- The homepage uses the first featured character as its main portrait and the first seven artworks as its showcase.
- Re-running the script is safe; it will not duplicate the stylesheet link.
