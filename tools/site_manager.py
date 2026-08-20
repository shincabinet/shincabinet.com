#!/usr/bin/env python3
"""Local GUI for managing the Shin Cabinet static site.

Run from anywhere inside the project:
    python3 tools/site_manager.py

The manager binds to 127.0.0.1 only, opens a browser, and writes directly to the
project files. It uses only Python's standard library.
"""
from __future__ import annotations

import argparse
import base64
import html
import json
import mimetypes
import os
import re
import shutil
import sys
import threading
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
CONTENT_FILE = ROOT / "assets" / "js" / "content.js"
PAGES_FILE = ROOT / "config" / "pages.js"
CUSTOM_PAGES_FILE = ROOT / "config" / "custom-pages.js"
TEMPLATE_FILE = ROOT / "tools" / "character-template.html"
MANAGER_FILE = ROOT / "tools" / "site-manager.html"
SITEMAP_FILE = ROOT / "sitemap.xml"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
REFERENCE_TEXT_EXTENSIONS = {".html", ".js", ".json", ".jsonc", ".css", ".md", ".xml", ".webmanifest", ".txt"}

CONTENT_HEADER = """/*
  MAIN CONTENT FILE
  -----------------
  This file is valid JSON wrapped in a browser assignment so it can be edited
  safely by tools/site_manager.py. You may still edit it by hand if needed.
  Page visibility lives in /config/pages.js.
*/
"""
CUSTOM_PAGES_HEADER = """/*
  CONTENT FOR GENERIC PAGES
  -------------------------
  These drafts stay saved even when their matching page is disabled in
  config/pages.js. Supported section types: text, cards, gallery, timeline,
  links, and callout.
*/
"""
PAGES_HEADER = """/*
  PAGE CONTROL CENTER
  -------------------
  This file is valid JSON wrapped in a browser assignment and can be safely
  rewritten by tools/site_manager.py or tools/manage_pages.py.
*/
"""


def read_assignment(path: Path) -> tuple[str, dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"window\.([A-Z0-9_]+)\s*=\s*", text)
    if not match:
        raise RuntimeError(f"Could not find a window assignment in {path}")
    variable = match.group(1)
    start = match.end()
    end = text.rfind(";")
    if end < start:
        end = len(text)
    try:
        return variable, json.loads(text[start:end].strip())
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"{path.relative_to(ROOT)} is not in manager-safe JSON format. "
            "Restore the GUI-managed version or convert the object to JSON first."
        ) from exc


def write_assignment(path: Path, variable: str, payload: dict[str, Any], header: str) -> None:
    rendered = json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(f"{header}window.{variable} = {rendered};\n", encoding="utf-8")


def safe_slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    if not value:
        raise ValueError("Character ID cannot be empty.")
    return value


def character_page(character: dict[str, Any]) -> str:
    template = TEMPLATE_FILE.read_text(encoding="utf-8")
    description = character.get("tagline") or f"{character.get('name', 'Character')} character profile and reference information."
    replacements = {
        "{{ID}}": html.escape(str(character["id"]), quote=True),
        "{{NAME}}": html.escape(str(character.get("name") or character["id"]), quote=False),
        "{{DESCRIPTION}}": html.escape(str(description), quote=True),
    }
    for source, replacement in replacements.items():
        template = template.replace(source, replacement)
    return template


def write_character_page(character: dict[str, Any], previous_id: str | None = None) -> None:
    character_id = safe_slug(str(character["id"]))
    if previous_id and previous_id != character_id:
        old_dir = ROOT / "characters" / safe_slug(previous_id)
        new_dir = ROOT / "characters" / character_id
        if old_dir.exists() and not new_dir.exists():
            old_dir.rename(new_dir)
    folder = ROOT / "characters" / character_id
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "index.html").write_text(character_page(character), encoding="utf-8")


def normalize_image_url(value: str) -> str:
    """Return a canonical /assets/images/... path without query/hash data."""
    value = unquote(str(value or "").strip())
    value = value.split("#", 1)[0].split("?", 1)[0]
    if not value.startswith("/assets/images/"):
        raise ValueError("Image path must live under /assets/images/.")
    return value


def image_file_from_url(value: str, require_exists: bool = True) -> Path:
    clean = normalize_image_url(value)
    base = (ROOT / "assets" / "images").resolve()
    target = (ROOT / clean.lstrip("/")).resolve()
    if base not in target.parents:
        raise ValueError("Invalid image path.")
    if target.suffix.lower() not in IMAGE_EXTENSIONS:
        raise ValueError("Unsupported image type.")
    if require_exists and (not target.exists() or not target.is_file()):
        raise ValueError("Image file does not exist.")
    return target


def reference_files():
    """Yield text files where public image references may live."""
    ignored_dirs = {".git", "node_modules", "__pycache__"}
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if any(part in ignored_dirs for part in rel.parts):
            continue
        if len(rel.parts) >= 2 and rel.parts[0] == "assets" and rel.parts[1] == "images":
            continue
        if path.suffix.lower() not in REFERENCE_TEXT_EXTENSIONS and path.name not in {"_headers", "_redirects", "robots.txt"}:
            continue
        yield path


def find_image_references(image_url: str) -> list[dict[str, Any]]:
    clean = normalize_image_url(image_url)
    refs: list[dict[str, Any]] = []
    for path in reference_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        count = text.count(clean)
        if count:
            refs.append({"file": path.relative_to(ROOT).as_posix(), "count": count})
    return refs


def image_mime_for_url(image_url: str) -> str:
    extension = Path(normalize_image_url(image_url)).suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".avif": "image/avif",
    }[extension]


def update_mime_hints(text: str, image_url: str) -> str:
    """Keep nearby HTML/manifest MIME hints accurate when an asset format changes."""
    mime = image_mime_for_url(image_url)
    output: list[str] = []
    for line in text.splitlines(keepends=True):
        if image_url in line:
            line = re.sub(r'(\btype\s*=\s*["\'])image/(?:png|jpeg|webp|gif|avif)(["\'])', rf'\1{mime}\2', line)
            line = re.sub(r'("type"\s*:\s*")image/(?:png|jpeg|webp|gif|avif)(")', rf'\1{mime}\2', line)
        output.append(line)
    return "".join(output)


def rewrite_image_references(old_url: str, new_url: str) -> list[dict[str, Any]]:
    """Replace an asset path everywhere while preserving existing query strings."""
    old_clean = normalize_image_url(old_url)
    new_clean = normalize_image_url(new_url)
    changed: list[dict[str, Any]] = []
    if old_clean == new_clean:
        return changed
    for path in reference_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        count = text.count(old_clean)
        if not count:
            continue
        updated = text.replace(old_clean, new_clean)
        if Path(old_clean).suffix.lower() != Path(new_clean).suffix.lower():
            updated = update_mime_hints(updated, new_clean)
        path.write_text(updated, encoding="utf-8")
        changed.append({"file": path.relative_to(ROOT).as_posix(), "count": count})
    return changed


def bump_image_version(image_url: str) -> int | None:
    """Bump ?v=N references so a replaced image appears immediately in browsers."""
    clean = normalize_image_url(image_url)
    pattern = re.compile(re.escape(clean) + r"\?v=(\d+)")
    highest = 0
    cache: list[tuple[Path, str]] = []
    for path in reference_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        matches = [int(m.group(1)) for m in pattern.finditer(text)]
        if matches:
            highest = max(highest, *matches)
            cache.append((path, text))
    if not cache:
        return None
    next_version = highest + 1
    for path, text in cache:
        path.write_text(pattern.sub(f"{clean}?v={next_version}", text), encoding="utf-8")
    return next_version


def decode_image_data(data_url: str) -> bytes:
    if "," not in data_url:
        raise ValueError("Invalid image upload.")
    encoded = data_url.split(",", 1)[1]
    binary = base64.b64decode(encoded, validate=True)
    if len(binary) > 20 * 1024 * 1024:
        raise ValueError("Image is larger than 20 MB.")
    return binary


def list_images() -> list[dict[str, Any]]:
    base = ROOT / "assets" / "images"
    result: list[dict[str, Any]] = []
    if not base.exists():
        return result
    for path in sorted(base.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        rel = "/" + path.relative_to(ROOT).as_posix()
        stat = path.stat()
        references = find_image_references(rel)
        result.append({
            "path": rel,
            "name": path.name,
            "size": stat.st_size,
            "referenceCount": sum(r["count"] for r in references),
            "references": references,
        })
    return result



def _assignment_label(source: str, path: list[Any], parent: dict[str, Any] | None = None) -> tuple[str, str]:
    """Return a friendly group/label for an image-bearing config field."""
    top = str(path[0]) if path else source
    groups = {
        "artworks": "Gallery",
        "characters": "Characters",
        "commissions": "Commissions",
        "adoptables": "Adoptables",
        "fursuitProjects": "Fursuits",
        "fursuitServices": "Fursuits",
        "site": "Site",
    }
    if source == "custom":
        group = "Custom pages"
    elif source == "pages":
        group = "Pages"
    else:
        group = groups.get(top, top.replace("_", " ").title())

    obj = parent or {}
    title = obj.get("title") or obj.get("name") or obj.get("label") or obj.get("id")
    if not title and top == "characters" and len(path) >= 2:
        title = f"Character {path[1]}"
    if not title:
        bits = [str(x) for x in path[:-1] if not isinstance(x, int)]
        title = " / ".join(bits[-2:]) or "Image"
    return group, str(title)


def collect_image_assignments() -> list[dict[str, Any]]:
    """Enumerate individual config image fields that can be repointed independently."""
    sources: list[tuple[str, Path]] = [("content", CONTENT_FILE), ("custom", CUSTOM_PAGES_FILE), ("pages", PAGES_FILE)]
    results: list[dict[str, Any]] = []
    for source, file_path in sources:
        if not file_path.exists():
            continue
        _, data = read_assignment(file_path)

        def walk(value: Any, path: list[Any], parent: dict[str, Any] | None = None) -> None:
            if isinstance(value, dict):
                for key, child in value.items():
                    child_path = path + [key]
                    if key == "image" and isinstance(child, str) and child.startswith("/assets/images/"):
                        group, label = _assignment_label(source, child_path, value)
                        results.append({
                            "source": source,
                            "path": child_path,
                            "group": group,
                            "label": label,
                            "image": child,
                            "cleanImage": child.split("#", 1)[0].split("?", 1)[0],
                            "configFile": file_path.relative_to(ROOT).as_posix(),
                        })
                    else:
                        walk(child, child_path, value)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    walk(child, path + [index], parent)

        walk(data, [])
    return results


def set_config_image_value(data: Any, path: list[Any], image_url: str) -> None:
    if not path or path[-1] != "image":
        raise ValueError("Invalid image assignment path.")
    current = data
    for part in path[:-1]:
        if isinstance(part, int):
            if not isinstance(current, list) or part < 0 or part >= len(current):
                raise ValueError("Image assignment no longer exists. Reload the manager.")
            current = current[part]
        elif isinstance(part, str):
            if not isinstance(current, dict) or part not in current:
                raise ValueError("Image assignment no longer exists. Reload the manager.")
            current = current[part]
        else:
            raise ValueError("Invalid image assignment path.")
    if not isinstance(current, dict) or "image" not in current:
        raise ValueError("Image assignment no longer exists. Reload the manager.")
    current["image"] = image_url

def walk_pages(items: list[dict[str, Any]], parent_enabled: bool = True):
    for item in items:
        enabled = parent_enabled and item.get("enabled", True)
        yield item, enabled
        yield from walk_pages(item.get("children", []), enabled)


def write_sitemap(pages: dict[str, Any], content: dict[str, Any] | None = None) -> None:
    base = pages.get("options", {}).get("siteUrl", "https://shincabinet.com").rstrip("/")
    urls: list[str] = []
    for item, enabled in walk_pages(pages.get("items", [])):
        if enabled and not item.get("navOnly", False):
            path = item.get("path", "/")
            urls.append(base + ("/" if path == "/" else path))
    if content:
        characters_page = next((i for i, e in walk_pages(pages.get("items", [])) if i.get("id") == "characters" and e), None)
        if characters_page:
            for character in content.get("characters", []):
                if character.get("enabled", True):
                    urls.append(base + character.get("path", f"/characters/{character.get('id')}/"))
    unique = list(dict.fromkeys(urls))
    body = "".join(f"  <url><loc>{html.escape(url)}</loc></url>\n" for url in unique)
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n'
    SITEMAP_FILE.write_text(xml, encoding="utf-8")


def normalize_character(raw: dict[str, Any]) -> dict[str, Any]:
    character = dict(raw)
    character["id"] = safe_slug(str(character.get("id") or character.get("name") or ""))
    character["name"] = str(character.get("name") or character["id"]).strip()
    character["path"] = f"/characters/{character['id']}/"
    character["enabled"] = bool(character.get("enabled", True))
    character["featured"] = bool(character.get("featured", False))
    for key in ("bio", "tags", "personality", "designNotes", "likes", "dislikes", "references", "facts", "palette", "links"):
        if not isinstance(character.get(key), list):
            character[key] = []
    return character


def json_response(handler: SimpleHTTPRequestHandler, status: int, payload: Any) -> None:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(data)


class Handler(SimpleHTTPRequestHandler):
    server_version = "ShinCabinetManager/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        sys.stdout.write("[site-manager] " + (format % args) + "\n")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in {"/__manager__", "/__manager__/"}:
            data = MANAGER_FILE.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return
        if parsed.path == "/api/state":
            try:
                _, content = read_assignment(CONTENT_FILE)
                _, pages = read_assignment(PAGES_FILE)
                json_response(self, 200, {"content": content, "pages": pages, "images": list_images(), "imageAssignments": collect_image_assignments()})
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 30 * 1024 * 1024:
                raise ValueError("Request is too large (30 MB maximum).")
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8") or "{}")
            if parsed.path == "/api/character/save":
                return self.save_character(payload)
            if parsed.path == "/api/character/delete":
                return self.delete_character(payload)
            if parsed.path == "/api/pages/save":
                return self.save_pages(payload)
            if parsed.path == "/api/site/save":
                return self.save_site(payload)
            if parsed.path == "/api/image/upload":
                return self.upload_image(payload)
            if parsed.path == "/api/image/replace":
                return self.replace_image(payload)
            if parsed.path == "/api/image/repoint":
                return self.repoint_image(payload)
            if parsed.path == "/api/image/delete":
                return self.delete_image(payload)
            if parsed.path == "/api/image-assignment/save":
                return self.save_image_assignment(payload)
            if parsed.path == "/api/image-assignments/save":
                return self.save_image_assignments(payload)
            json_response(self, 404, {"error": "Unknown API endpoint."})
        except Exception as exc:
            json_response(self, 400, {"error": str(exc)})

    def save_character(self, payload: dict[str, Any]) -> None:
        previous_id = payload.get("previousId") or None
        character = normalize_character(payload.get("character") or {})
        variable, content = read_assignment(CONTENT_FILE)
        characters = content.setdefault("characters", [])
        existing = next((c for c in characters if c.get("id") == character["id"] and c.get("id") != previous_id), None)
        if existing:
            raise ValueError(f"A character with ID '{character['id']}' already exists.")
        index = next((i for i, c in enumerate(characters) if c.get("id") == previous_id), None) if previous_id else None
        if index is None:
            characters.append(character)
        else:
            characters[index] = character
        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        write_character_page(character, previous_id)
        _, pages = read_assignment(PAGES_FILE)
        write_sitemap(pages, content)
        json_response(self, 200, {"ok": True, "character": character, "images": list_images()})

    def delete_character(self, payload: dict[str, Any]) -> None:
        character_id = safe_slug(str(payload.get("id") or ""))
        variable, content = read_assignment(CONTENT_FILE)
        before = len(content.get("characters", []))
        content["characters"] = [c for c in content.get("characters", []) if c.get("id") != character_id]
        if len(content["characters"]) == before:
            raise ValueError("Character not found.")
        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        folder = ROOT / "characters" / character_id
        if folder.exists() and folder.is_dir():
            shutil.rmtree(folder)
        _, pages = read_assignment(PAGES_FILE)
        write_sitemap(pages, content)
        json_response(self, 200, {"ok": True})

    def save_pages(self, payload: dict[str, Any]) -> None:
        pages = payload.get("pages")
        if not isinstance(pages, dict) or not isinstance(pages.get("items"), list):
            raise ValueError("Invalid page configuration.")
        write_assignment(PAGES_FILE, "SHIN_PAGES", pages, PAGES_HEADER)
        _, content = read_assignment(CONTENT_FILE)
        write_sitemap(pages, content)
        json_response(self, 200, {"ok": True})

    def save_site(self, payload: dict[str, Any]) -> None:
        site = payload.get("site")
        if not isinstance(site, dict):
            raise ValueError("Invalid site settings.")
        variable, content = read_assignment(CONTENT_FILE)
        existing = content.setdefault("site", {})
        # Only replace top-level settings exposed by the GUI; preserve contacts/social structures.
        for key in ("name", "shortName", "artistName", "handle", "intro", "profileBlurb", "email", "commissionStatus", "commissionNote", "fursuitStatus", "fursuitNote"):
            if key in site:
                existing[key] = site[key]
        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        json_response(self, 200, {"ok": True})


    def save_image_assignment(self, payload: dict[str, Any]) -> None:
        item = payload.get("assignment") or {}
        self._save_image_assignment_items([item])

    def save_image_assignments(self, payload: dict[str, Any]) -> None:
        items = payload.get("assignments")
        if not isinstance(items, list) or not items:
            raise ValueError("No image assignments were supplied.")
        self._save_image_assignment_items(items)

    def _save_image_assignment_items(self, items: list[dict[str, Any]]) -> None:
        file_map = {
            "content": (CONTENT_FILE, CONTENT_HEADER),
            "custom": (CUSTOM_PAGES_FILE, CUSTOM_PAGES_HEADER),
            "pages": (PAGES_FILE, PAGES_HEADER),
        }
        loaded: dict[str, tuple[str, dict[str, Any], Path, str]] = {}
        changed_sources: set[str] = set()
        changed_count = 0
        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Invalid image assignment.")
            source = str(item.get("source") or "")
            if source not in file_map:
                raise ValueError("Unknown image assignment source.")
            path = item.get("path")
            if not isinstance(path, list):
                raise ValueError("Invalid image assignment path.")
            image_url = normalize_image_url(str(item.get("image") or ""))
            image_file_from_url(image_url)
            if source not in loaded:
                file_path, header = file_map[source]
                variable, data = read_assignment(file_path)
                loaded[source] = (variable, data, file_path, header)
            variable, data, file_path, header = loaded[source]
            # Only permit paths currently exposed by the manager. This prevents a
            # stale/custom request from editing unrelated config values.
            valid = any(a["source"] == source and a["path"] == path for a in collect_image_assignments())
            if not valid:
                raise ValueError("Image assignment no longer exists. Reload the manager.")
            set_config_image_value(data, path, image_url)
            changed_sources.add(source)
            changed_count += 1

        for source in changed_sources:
            variable, data, file_path, header = loaded[source]
            write_assignment(file_path, variable, data, header)

        json_response(self, 200, {
            "ok": True,
            "updated": changed_count,
            "imageAssignments": collect_image_assignments(),
            "images": list_images(),
        })

    def upload_image(self, payload: dict[str, Any]) -> None:
        filename = Path(str(payload.get("filename") or "image")).name
        extension = Path(filename).suffix.lower()
        if extension not in IMAGE_EXTENSIONS:
            raise ValueError("Supported image types: PNG, JPG, JPEG, WebP, GIF, AVIF.")
        character_id = payload.get("characterId")
        if character_id:
            folder = ROOT / "assets" / "images" / "characters" / safe_slug(str(character_id))
        else:
            folder = ROOT / "assets" / "images" / "library"
        folder.mkdir(parents=True, exist_ok=True)
        stem = safe_slug(Path(filename).stem) or "image"
        target = folder / f"{stem}{extension}"
        if target.exists():
            rel = "/" + target.relative_to(ROOT).as_posix()
            raise ValueError(f"{rel} already exists. Use Replace from the image card instead.")
        target.write_bytes(decode_image_data(str(payload.get("data") or "")))
        rel = "/" + target.relative_to(ROOT).as_posix()
        json_response(self, 200, {"ok": True, "path": rel, "images": list_images()})

    def replace_image(self, payload: dict[str, Any]) -> None:
        old_url = normalize_image_url(str(payload.get("path") or ""))
        old_file = image_file_from_url(old_url)
        filename = Path(str(payload.get("filename") or old_file.name)).name
        extension = Path(filename).suffix.lower()
        if extension not in IMAGE_EXTENSIONS:
            raise ValueError("Supported image types: PNG, JPG, JPEG, WebP, GIF, AVIF.")
        binary = decode_image_data(str(payload.get("data") or ""))

        # Preserve the canonical filename whenever the format stays the same. If the
        # format changes, keep the stem and update every site reference to the new extension.
        if extension == old_file.suffix.lower():
            target = old_file
        else:
            target = old_file.with_suffix(extension)
            if target.exists() and target != old_file:
                rel = "/" + target.relative_to(ROOT).as_posix()
                raise ValueError(f"Cannot change format because {rel} already exists.")

        temp = target.with_name(target.name + ".manager-tmp")
        temp.write_bytes(binary)
        os.replace(temp, target)
        new_url = "/" + target.relative_to(ROOT).as_posix()
        changed = rewrite_image_references(old_url, new_url) if new_url != old_url else []
        version = bump_image_version(new_url)
        if target != old_file and old_file.exists():
            old_file.unlink()
        json_response(self, 200, {
            "ok": True,
            "oldPath": old_url,
            "path": new_url,
            "updatedReferences": sum(item["count"] for item in changed),
            "updatedFiles": changed,
            "cacheVersion": version,
            "images": list_images(),
        })

    def repoint_image(self, payload: dict[str, Any]) -> None:
        old_url = normalize_image_url(str(payload.get("path") or ""))
        new_url = normalize_image_url(str(payload.get("replacementPath") or ""))
        image_file_from_url(old_url)
        image_file_from_url(new_url)
        if old_url == new_url:
            raise ValueError("Choose a different replacement image.")
        changed = rewrite_image_references(old_url, new_url)
        json_response(self, 200, {
            "ok": True,
            "path": old_url,
            "replacementPath": new_url,
            "updatedReferences": sum(item["count"] for item in changed),
            "updatedFiles": changed,
            "images": list_images(),
        })

    def delete_image(self, payload: dict[str, Any]) -> None:
        old_url = normalize_image_url(str(payload.get("path") or ""))
        old_file = image_file_from_url(old_url)
        replacement_raw = str(payload.get("replacementPath") or "").strip()
        refs = find_image_references(old_url)
        changed: list[dict[str, Any]] = []
        replacement_url = None
        if refs:
            if not replacement_raw:
                count = sum(item["count"] for item in refs)
                raise ValueError(f"This image is still referenced {count} time(s). Choose a replacement image before deleting it.")
            replacement_url = normalize_image_url(replacement_raw)
            image_file_from_url(replacement_url)
            if replacement_url == old_url:
                raise ValueError("Replacement image must be different from the image being deleted.")
            changed = rewrite_image_references(old_url, replacement_url)
        old_file.unlink()
        json_response(self, 200, {
            "ok": True,
            "path": old_url,
            "replacementPath": replacement_url,
            "updatedReferences": sum(item["count"] for item in changed),
            "updatedFiles": changed,
            "images": list_images(),
        })


def main() -> int:
    parser = argparse.ArgumentParser(description="Open the Shin Cabinet local site manager GUI.")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the browser.")
    args = parser.parse_args()
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    manager_url = f"http://127.0.0.1:{args.port}/__manager__/"
    preview_url = f"http://127.0.0.1:{args.port}/"
    print(f"Shin Cabinet Site Manager: {manager_url}")
    print(f"Live site preview:          {preview_url}")
    print("Press Ctrl+C to stop.")
    if not args.no_browser:
        threading.Timer(0.4, lambda: webbrowser.open(manager_url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
