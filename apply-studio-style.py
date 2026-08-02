#!/usr/bin/env python3
"""Apply the quiet studio skin to every HTML page in the current repository."""
from __future__ import annotations

from pathlib import Path
import shutil
import sys

PATCH_ROOT = Path(__file__).resolve().parent
REPO_ROOT = Path.cwd().resolve()

if not (REPO_ROOT / "assets").exists():
    raise SystemExit("Run this from the root of the Shin Cabinet repository.")

for relative in (
    Path("assets/css/studio-minimal.css"),
    Path("assets/js/home-minimal.js"),
):
    source = PATCH_ROOT / relative
    target = REPO_ROOT / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)

shutil.copy2(PATCH_ROOT / "index.html", REPO_ROOT / "index.html")

stylesheet = '<link rel="stylesheet" href="/assets/css/studio-minimal.css">'
changed = 0
for html_file in REPO_ROOT.rglob("*.html"):
    if html_file == REPO_ROOT / "index.html":
        continue
    text = html_file.read_text(encoding="utf-8")
    if "studio-minimal.css" in text:
        continue
    marker = '<link rel="stylesheet" href="/assets/css/styles.css">'
    if marker not in text:
        print(f"Skipped {html_file.relative_to(REPO_ROOT)}: styles.css link not found", file=sys.stderr)
        continue
    text = text.replace(marker, marker + stylesheet, 1)
    html_file.write_text(text, encoding="utf-8")
    changed += 1

print(f"Applied studio styling. Updated the homepage and injected the override into {changed} other HTML pages.")
