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
IMAGE_ID_RE = re.compile(r"^img_[0-9a-f]{32}$", re.IGNORECASE)
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


def atomic_write_text(path: Path, text: str) -> None:
    """Write a UTF-8 text file atomically and flush it to disk."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.site-manager-{os.getpid()}.tmp")
    try:
        with temporary.open("w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
        try:
            directory_fd = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
        except OSError:
            pass
    finally:
        if temporary.exists():
            temporary.unlink(missing_ok=True)


def site_revision() -> str:
    """Return a revision token for files used by the local preview."""
    watched = [CONTENT_FILE, PAGES_FILE, CUSTOM_PAGES_FILE, SITEMAP_FILE]
    watched.extend(ROOT.glob("*.html"))
    watched.extend((ROOT / "characters").glob("*/index.html"))
    parts: list[str] = []
    for path in watched:
        if not path.exists() or not path.is_file():
            continue
        stat = path.stat()
        try:
            name = path.relative_to(ROOT).as_posix()
        except ValueError:
            name = str(path)
        parts.append(f"{name}:{stat.st_mtime_ns}:{stat.st_size}")
    return str(hash("|".join(sorted(parts))))


def manager_diagnostics() -> dict[str, Any]:
    def file_info(path: Path) -> dict[str, Any]:
        rel = path.relative_to(ROOT).as_posix()
        if not path.exists():
            return {"path": rel, "exists": False}
        stat = path.stat()
        return {"path": rel, "exists": True, "size": stat.st_size, "modifiedNs": stat.st_mtime_ns}

    return {
        "root": str(ROOT),
        "pid": os.getpid(),
        "revision": site_revision(),
        "files": [file_info(CONTENT_FILE), file_info(PAGES_FILE), file_info(CUSTOM_PAGES_FILE)],
    }


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
    atomic_write_text(path, f"{header}window.{variable} = {rendered};\n")
    saved_variable, saved_payload = read_assignment(path)
    if saved_variable != variable or saved_payload != payload:
        raise RuntimeError(f"Save verification failed for {path.relative_to(ROOT)}")


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
    atomic_write_text(folder / "index.html", character_page(character))


def normalize_image_url(value: str) -> str:
    """Normalize a website image reference.

    Dynamic image IDs (img_<uuidhex>) are the preferred format. Direct HTTPS
    image-host URLs and legacy /assets/images/... paths remain accepted while
    older content is migrated.
    """
    raw = str(value or "").strip()
    if not raw:
        raise ValueError("Image reference is required.")

    if IMAGE_ID_RE.fullmatch(raw):
        return raw.lower()

    if raw.startswith("/assets/images/"):
        clean = unquote(raw.split("#", 1)[0].split("?", 1)[0])
        if Path(clean).suffix.lower() not in IMAGE_EXTENSIONS:
            raise ValueError("Unsupported image type.")
        return clean

    parsed = urlparse(raw)
    if parsed.scheme.lower() != "https" or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError("Use an image ID (img_…), https:// image URL, or legacy /assets/images/... path.")

    # Pasting a stable /i/<id> URL is accepted, but canonical website data
    # stores only the ID so the host remains centrally configurable.
    dynamic_match = re.fullmatch(r"/i/(img_[0-9a-f]{32})/?", unquote(parsed.path), re.IGNORECASE)
    if dynamic_match:
        return dynamic_match.group(1).lower()

    if Path(unquote(parsed.path)).suffix.lower() not in IMAGE_EXTENSIONS:
        raise ValueError("Image URL must end in PNG, JPG, JPEG, WebP, GIF, or AVIF.")
    return f"https://{parsed.netloc}{parsed.path}"


def is_dynamic_image_id(value: str) -> bool:
    return bool(IMAGE_ID_RE.fullmatch(str(value or "").strip()))


def is_remote_image_url(value: str) -> bool:
    return str(value or "").lower().startswith("https://")


def looks_like_image_reference(value: Any) -> bool:
    try:
        normalize_image_url(str(value or ""))
        return True
    except ValueError:
        return False


def image_file_from_url(value: str, require_exists: bool = True) -> Path:
    clean = normalize_image_url(value)
    if is_remote_image_url(clean) or is_dynamic_image_id(clean):
        raise ValueError("Remote/dynamic images are managed by images.shincabinet.com, not the website repository.")
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


def image_mime_for_url(image_url: str) -> str | None:
    clean = normalize_image_url(image_url)
    if is_dynamic_image_id(clean):
        return None
    extension = Path(urlparse(clean).path if is_remote_image_url(clean) else clean).suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".avif": "image/avif",
    }.get(extension)


def update_mime_hints(text: str, image_url: str) -> str:
    """Keep nearby HTML/manifest MIME hints accurate when an asset format changes."""
    mime = image_mime_for_url(image_url)
    if not mime:
        return text
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
        if not is_dynamic_image_id(new_clean) and Path(old_clean).suffix.lower() != Path(new_clean).suffix.lower():
            updated = update_mime_hints(updated, new_clean)
        atomic_write_text(path, updated)
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
        atomic_write_text(path, pattern.sub(f"{clean}?v={next_version}", text))
    return next_version


def decode_image_data(data_url: str) -> bytes:
    if "," not in data_url:
        raise ValueError("Invalid image upload.")
    encoded = data_url.split(",", 1)[1]
    binary = base64.b64decode(encoded, validate=True)
    if len(binary) > 20 * 1024 * 1024:
        raise ValueError("Image is larger than 20 MB.")
    return binary


def media_settings() -> dict[str, Any]:
    try:
        _, content = read_assignment(CONTENT_FILE)
        media = content.get("site", {}).get("media", {})
        return media if isinstance(media, dict) else {}
    except Exception:
        return {}


def public_original_image_url(image_url: str) -> str:
    clean = normalize_image_url(image_url)
    media = media_settings()
    host = str(media.get("imageHost") or "").strip().rstrip("/")
    if is_dynamic_image_id(clean):
        return f"{host}/i/{clean}" if host else clean
    if is_remote_image_url(clean):
        return clean
    # Legacy /assets/images/... references always stay local. Only img_... IDs
    # resolve through the remote host.
    return clean


def validate_image_reference(image_url: str) -> str:
    """Validate a direct image-host URL or a legacy local image path."""
    clean = normalize_image_url(image_url)
    media = media_settings()
    host = str(media.get("imageHost") or "").strip().rstrip("/")

    if is_dynamic_image_id(clean):
        if not host:
            raise ValueError("Configure the image host in Site settings first.")
        return clean

    if is_remote_image_url(clean):
        if not host:
            raise ValueError("Configure the image host in Site settings first.")
        expected = urlparse(host)
        actual = urlparse(clean)
        if actual.scheme.lower() != "https" or actual.netloc.lower() != expected.netloc.lower():
            raise ValueError(f"Image URL must be hosted on {host}.")
        return clean

    target = image_file_from_url(clean, require_exists=False)
    if target.exists() and target.is_file():
        return clean
    raise ValueError("Legacy image file does not exist locally. Upload it to the Pi and use its img_... ID instead.")


def referenced_image_urls() -> set[str]:
    """Return image references used by runtime configuration."""
    local_pattern = re.compile(r"/assets/images/[A-Za-z0-9_./%+@() -]+\.(?:png|jpe?g|webp|gif|avif)", re.IGNORECASE)
    remote_pattern = re.compile(r"https://[^\s\"'<>]+\.(?:png|jpe?g|webp|gif|avif)(?:[?#][^\s\"'<>]*)?", re.IGNORECASE)
    id_pattern = re.compile(r"\bimg_[0-9a-f]{32}\b", re.IGNORECASE)
    result: set[str] = set()
    for path in (CONTENT_FILE, CUSTOM_PAGES_FILE, PAGES_FILE):
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for pattern in (local_pattern, remote_pattern, id_pattern):
            for match in pattern.finditer(text):
                try:
                    result.add(normalize_image_url(match.group(0)))
                except ValueError:
                    pass
    return result


def list_images() -> list[dict[str, Any]]:
    base = ROOT / "assets" / "images"
    physical: dict[str, Path] = {}
    if base.exists():
        for path in sorted(base.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            physical["/" + path.relative_to(ROOT).as_posix()] = path

    all_paths = set(physical) | referenced_image_urls()
    result: list[dict[str, Any]] = []
    for rel in sorted(all_paths):
        path = physical.get(rel)
        references = find_image_references(rel)
        result.append({
            "path": rel,
            "name": rel if is_dynamic_image_id(rel) else Path(rel).name,
            "size": path.stat().st_size if path else 0,
            "existsLocally": path is not None,
            "remoteOnly": path is None,
            "previewUrl": public_original_image_url(rel),
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
                    if key == "image" and isinstance(child, str) and looks_like_image_reference(child):
                        group, label = _assignment_label(source, child_path, value)
                        results.append({
                            "source": source,
                            "path": child_path,
                            "group": group,
                            "label": label,
                            "image": child,
                            "cleanImage": normalize_image_url(child),
                            "configFile": file_path.relative_to(ROOT).as_posix(),
                        })
                    else:
                        walk(child, child_path, value)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    walk(child, path + [index], parent)

        walk(data, [])
    return results


def get_config_image_value(data: Any, path: list[Any]) -> str:
    if not path or path[-1] != "image":
        raise ValueError("Invalid image assignment path.")
    current = data
    for part in path:
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
    if not isinstance(current, str):
        raise ValueError("Image assignment no longer exists. Reload the manager.")
    return current


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


def replace_matching_config_images(data: Any, old_url: str, new_url: str) -> int:
    """Replace matching image fields inside manager-owned configuration data.

    This is intentionally limited to dictionary keys named ``image`` so a legacy
    artwork migration cannot accidentally rewrite unrelated URLs, prose, favicon
    markup, or template assets. Query-string versions on legacy paths compare by
    their normalized canonical image path.
    """
    old_clean = normalize_image_url(old_url)
    new_clean = normalize_image_url(new_url)
    changed = 0

    def walk(value: Any) -> None:
        nonlocal changed
        if isinstance(value, dict):
            for key, child in list(value.items()):
                if key == "image" and isinstance(child, str) and looks_like_image_reference(child):
                    try:
                        child_clean = normalize_image_url(child)
                    except ValueError:
                        continue
                    if child_clean == old_clean:
                        value[key] = new_clean
                        changed += 1
                else:
                    walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(data)
    return changed

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
    atomic_write_text(SITEMAP_FILE, xml)


def normalize_artist_url(value: Any) -> str:
    url = str(value or "").strip()[:500]
    if not url:
        return ""
    explicit_scheme = re.match(r"^[A-Za-z][A-Za-z0-9+.-]*:", url)
    if explicit_scheme and not re.match(r"^https?:\/\/", url, re.IGNORECASE):
        raise ValueError("Artist credit links must use http:// or https://.")
    if url.startswith("//"):
        url = "https:" + url
    elif not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("Artist credit links must be valid http:// or https:// URLs.")
    return url


def normalize_character(raw: dict[str, Any]) -> dict[str, Any]:
    character = dict(raw)
    character["id"] = safe_slug(str(character.get("id") or character.get("name") or ""))
    character["name"] = str(character.get("name") or character["id"]).strip()
    character["path"] = f"/characters/{character['id']}/"
    character["enabled"] = bool(character.get("enabled", True))
    character["featured"] = bool(character.get("featured", False))

    # Canonicalize image links at save time. Direct image-host URLs must remain
    # direct URLs; they must never be converted back to /assets/images paths.
    main_image = str(character.get("image") or "").strip()
    if main_image:
        character["image"] = validate_image_reference(main_image)

    for key in ("bio", "tags", "personality", "designNotes", "likes", "dislikes", "references", "facts", "palette", "links"):
        if not isinstance(character.get(key), list):
            character[key] = []
    normalized_references: list[dict[str, Any]] = []
    for raw_reference in character["references"]:
        if not isinstance(raw_reference, dict):
            continue
        reference = dict(raw_reference)
        reference_image = str(reference.get("image") or "").strip()
        if reference_image:
            reference["image"] = validate_image_reference(reference_image)

        raw_alternatives = reference.get("alternatives")
        if isinstance(raw_alternatives, list):
            normalized_alternatives: list[dict[str, Any]] = []
            for raw_alt in raw_alternatives:
                if not isinstance(raw_alt, dict):
                    continue
                alt = dict(raw_alt)
                alt_image = str(alt.get("image") or "").strip()
                if not alt_image:
                    continue
                alt["image"] = validate_image_reference(alt_image)
                normalized_alternatives.append(alt)
            if normalized_alternatives:
                reference["alternatives"] = normalized_alternatives
            else:
                reference.pop("alternatives", None)

        artist = str(reference.get("artist") or "").strip()[:120]
        artist_url = normalize_artist_url(reference.get("artistUrl")) if reference.get("artistUrl") else ""
        if artist:
            reference["artist"] = artist
            if artist_url:
                reference["artistUrl"] = artist_url
            else:
                reference.pop("artistUrl", None)
        else:
            reference.pop("artist", None)
            reference.pop("artistUrl", None)
        normalized_references.append(reference)
    character["references"] = normalized_references
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

    def end_headers(self) -> None:
        # Local preview files must never be hidden behind browser cache. The
        # production site keeps its own cache policy via _headers.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def preview_html_path(self, request_path: str) -> Path | None:
        clean = unquote(request_path).split("?", 1)[0]
        relative = clean.lstrip("/")
        candidate = (ROOT / relative).resolve() if relative else ROOT.resolve()
        root = ROOT.resolve()
        if candidate != root and root not in candidate.parents:
            return None
        if candidate.is_dir():
            candidate = candidate / "index.html"
        if candidate.is_file() and candidate.suffix.lower() == ".html":
            return candidate
        return None

    def serve_preview_html(self, path: Path) -> None:
        text = path.read_text(encoding="utf-8")
        helper = '''<script data-site-manager-preview>
(() => {
  let knownRevision = null;
  let stopped = false;
  async function poll() {
    if (stopped) return;
    try {
      const response = await fetch('/api/revision', {cache: 'no-store'});
      if (!response.ok) return;
      const data = await response.json();
      if (knownRevision !== null && data.revision !== knownRevision) {
        location.reload();
        return;
      }
      knownRevision = data.revision;
    } catch (_) {}
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) poll();
  });
  window.addEventListener('beforeunload', () => { stopped = true; });
  poll();
  setInterval(poll, 700);
})();
</script>'''
        if "</body>" in text:
            text = text.replace("</body>", helper + "\n</body>", 1)
        else:
            text += helper
        data = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Site-Manager-Root", str(ROOT))
        self.send_header("X-Site-Manager-Revision", site_revision())
        self.end_headers()
        self.wfile.write(data)

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
        if parsed.path == "/api/revision":
            json_response(self, 200, {"revision": site_revision()})
            return
        if parsed.path == "/api/state":
            try:
                _, content = read_assignment(CONTENT_FILE)
                _, pages = read_assignment(PAGES_FILE)
                json_response(self, 200, {"content": content, "pages": pages, "images": list_images(), "imageAssignments": collect_image_assignments(), "manager": manager_diagnostics()})
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
            return
        preview_path = self.preview_html_path(parsed.path)
        if preview_path is not None:
            self.serve_preview_html(preview_path)
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
            if parsed.path == "/api/image-variants/save":
                return self.save_image_variants(payload)
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
        previous_character = dict(characters[index]) if index is not None else None
        if index is None:
            characters.append(character)
        else:
            characters[index] = character

        # When the character editor is used to replace a legacy path with a
        # direct image-host URL, migrate other config entries that point at the
        # exact same legacy image. This avoids leaving a duplicate Gallery or
        # reference entry on /assets/images after the visible character field
        # was moved to images.shincabinet.com.
        migration_pairs: list[tuple[str, str]] = []
        if previous_character:
            old_main = str(previous_character.get("image") or "").strip()
            new_main = str(character.get("image") or "").strip()
            if old_main and new_main:
                old_clean = normalize_image_url(old_main)
                new_clean = normalize_image_url(new_main)
                if (old_clean.startswith("/assets/images/") or is_remote_image_url(old_clean)) and (is_remote_image_url(new_clean) or is_dynamic_image_id(new_clean)):
                    migration_pairs.append((old_clean, new_clean))

            old_refs = previous_character.get("references") if isinstance(previous_character.get("references"), list) else []
            new_refs = character.get("references") if isinstance(character.get("references"), list) else []
            for old_ref, new_ref in zip(old_refs, new_refs):
                if not isinstance(old_ref, dict) or not isinstance(new_ref, dict):
                    continue
                old_image = str(old_ref.get("image") or "").strip()
                new_image = str(new_ref.get("image") or "").strip()
                if not old_image or not new_image:
                    continue
                old_clean = normalize_image_url(old_image)
                new_clean = normalize_image_url(new_image)
                if (old_clean.startswith("/assets/images/") or is_remote_image_url(old_clean)) and (is_remote_image_url(new_clean) or is_dynamic_image_id(new_clean)):
                    migration_pairs.append((old_clean, new_clean))

        changed_custom = False
        changed_pages = False
        if migration_pairs:
            seen: set[tuple[str, str]] = set()
            custom_variable, custom_data = read_assignment(CUSTOM_PAGES_FILE)
            pages_variable, pages_data = read_assignment(PAGES_FILE)
            for old_url, new_url in migration_pairs:
                if (old_url, new_url) in seen:
                    continue
                seen.add((old_url, new_url))
                replace_matching_config_images(content, old_url, new_url)
                if replace_matching_config_images(custom_data, old_url, new_url):
                    changed_custom = True
                if replace_matching_config_images(pages_data, old_url, new_url):
                    changed_pages = True
            if changed_custom:
                write_assignment(CUSTOM_PAGES_FILE, custom_variable, custom_data, CUSTOM_PAGES_HEADER)
            if changed_pages:
                write_assignment(PAGES_FILE, pages_variable, pages_data, PAGES_HEADER)

        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        write_character_page(character, previous_id)
        _, pages = read_assignment(PAGES_FILE)
        write_sitemap(pages, content)
        json_response(self, 200, {"ok": True, "character": character, "images": list_images(), "manager": manager_diagnostics()})

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
        json_response(self, 200, {"ok": True, "manager": manager_diagnostics()})

    def save_pages(self, payload: dict[str, Any]) -> None:
        pages = payload.get("pages")
        if not isinstance(pages, dict) or not isinstance(pages.get("items"), list):
            raise ValueError("Invalid page configuration.")
        write_assignment(PAGES_FILE, "SHIN_PAGES", pages, PAGES_HEADER)
        _, content = read_assignment(CONTENT_FILE)
        write_sitemap(pages, content)
        json_response(self, 200, {"ok": True, "manager": manager_diagnostics()})

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

        if "media" in site:
            media = site.get("media")
            if not isinstance(media, dict):
                raise ValueError("Invalid media settings.")
            image_host = str(media.get("imageHost") or "").strip().rstrip("/")
            if image_host and not re.fullmatch(r"https://[^\s/]+(?:\.[^\s/]+)+", image_host, flags=re.IGNORECASE):
                raise ValueError("Image host must be an HTTPS origin such as https://images.shincabinet.com.")
            try:
                max_dimension = int(media.get("maxImageDimension", 0) or 0)
            except (TypeError, ValueError):
                raise ValueError("Maximum image dimension must be a whole number.")
            if max_dimension < 0 or max_dimension > 12000:
                raise ValueError("Maximum image dimension must be between 0 and 12000 pixels.")
            existing["media"] = {
                "imageHost": image_host,
                "maxImageDimension": max_dimension,
            }
        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        json_response(self, 200, {"ok": True, "manager": manager_diagnostics()})


    def save_image_variants(self, payload: dict[str, Any]) -> None:
        kind = str(payload.get("kind") or "")
        raw_alternatives = payload.get("alternatives")
        artist = str(payload.get("artist") or "").strip()[:120]
        artist_url = normalize_artist_url(payload.get("artistUrl")) if payload.get("artistUrl") else ""
        if not isinstance(raw_alternatives, list):
            raise ValueError("Alternatives must be a list.")
        if len(raw_alternatives) > 40:
            raise ValueError("A single image can have at most 40 alternatives.")

        alternatives: list[dict[str, str]] = []
        for index, raw in enumerate(raw_alternatives):
            if not isinstance(raw, dict):
                raise ValueError("Invalid alternative image entry.")
            image_url = normalize_image_url(str(raw.get("image") or ""))
            validate_image_reference(image_url)
            title = str(raw.get("title") or f"Alternative {index + 1}").strip()[:120]
            alt = str(raw.get("alt") or "").strip()[:500]
            alternatives.append({"title": title or f"Alternative {index + 1}", "image": image_url, "alt": alt})

        variable, content = read_assignment(CONTENT_FILE)
        target: dict[str, Any] | None = None

        if kind == "artwork":
            artwork_id = str(payload.get("id") or "")
            target = next((item for item in content.get("artworks", []) if str(item.get("id")) == artwork_id), None)
            if target is None:
                raise ValueError("Gallery artwork no longer exists. Reload the manager.")
        elif kind == "reference":
            character_id = str(payload.get("characterId") or "")
            reference_index = payload.get("referenceIndex")
            if not isinstance(reference_index, int):
                raise ValueError("Invalid reference image index.")
            character = next((item for item in content.get("characters", []) if str(item.get("id")) == character_id), None)
            if character is None:
                raise ValueError("Character no longer exists. Reload the manager.")
            references = character.get("references", [])
            if reference_index < 0 or reference_index >= len(references):
                raise ValueError("Reference image no longer exists. Reload the manager.")
            target = references[reference_index]
            primary = str(payload.get("primaryImage") or "")
            if primary and normalize_image_url(str(target.get("image") or "")) != normalize_image_url(primary):
                raise ValueError("Reference image changed since this page loaded. Reload the manager.")
        else:
            raise ValueError("Unknown image variant source.")

        if alternatives:
            target["alternatives"] = alternatives
        else:
            target.pop("alternatives", None)
        if artist:
            target["artist"] = artist
            if artist_url:
                target["artistUrl"] = artist_url
            else:
                target.pop("artistUrl", None)
        else:
            target.pop("artist", None)
            target.pop("artistUrl", None)

        write_assignment(CONTENT_FILE, variable, content, CONTENT_HEADER)
        json_response(self, 200, {
            "ok": True,
            "alternatives": alternatives,
            "artist": artist,
            "artistUrl": artist_url,
            "images": list_images(),
            "imageAssignments": collect_image_assignments(),
            "manager": manager_diagnostics(),
        })


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

        def load_source(source: str) -> tuple[str, dict[str, Any], Path, str]:
            if source not in loaded:
                file_path, header = file_map[source]
                variable, data = read_assignment(file_path)
                loaded[source] = (variable, data, file_path, header)
            return loaded[source]

        changed_sources: set[str] = set()
        selected_updates = 0
        migration_pairs: list[tuple[str, str]] = []

        # Snapshot the currently exposed assignments before mutating in-memory data.
        valid_assignments = {(a["source"], tuple(a["path"])) for a in collect_image_assignments()}

        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Invalid image assignment.")
            source = str(item.get("source") or "")
            if source not in file_map:
                raise ValueError("Unknown image assignment source.")
            path = item.get("path")
            if not isinstance(path, list):
                raise ValueError("Invalid image assignment path.")
            if (source, tuple(path)) not in valid_assignments:
                raise ValueError("Image assignment no longer exists. Reload the manager.")

            new_url = validate_image_reference(str(item.get("image") or ""))
            variable, data, file_path, header = load_source(source)
            old_url = get_config_image_value(data, path)
            old_clean = normalize_image_url(old_url)

            set_config_image_value(data, path, new_url)
            changed_sources.add(source)
            selected_updates += 1

            # Legacy -> remote is a migration, not merely a one-off field edit.
            # If the same legacy file is referenced by multiple manager-owned
            # config entries, migrate those matching references together so an
            # old /assets/images copy cannot silently keep winning elsewhere.
            if (old_clean.startswith("/assets/images/") or is_remote_image_url(old_clean)) and (is_remote_image_url(new_url) or is_dynamic_image_id(new_url)):
                migration_pairs.append((old_clean, new_url))

        migrated_matches = 0
        if migration_pairs:
            # Load all manager-owned configuration sources so matching legacy
            # references in Gallery, Characters, custom pages, etc. are covered.
            for source in file_map:
                load_source(source)
            seen_pairs: set[tuple[str, str]] = set()
            for old_url, new_url in migration_pairs:
                pair = (old_url, new_url)
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)
                for source, (_, data, _, _) in loaded.items():
                    count = replace_matching_config_images(data, old_url, new_url)
                    if count:
                        changed_sources.add(source)
                        migrated_matches += count

        for source in changed_sources:
            variable, data, file_path, header = loaded[source]
            write_assignment(file_path, variable, data, header)

        json_response(self, 200, {
            "ok": True,
            "updated": selected_updates,
            "migratedMatches": migrated_matches,
            "imageAssignments": collect_image_assignments(),
            "images": list_images(),
            "manager": manager_diagnostics(),
        })

    def upload_image(self, payload: dict[str, Any]) -> None:
        raise ValueError("Local image uploads are disabled. Upload artwork with the Raspberry Pi Image Manager, copy its Image ID, then paste that ID here.")

    def replace_image(self, payload: dict[str, Any]) -> None:
        raise ValueError("Local image replacement is disabled. Replace the file under the same Image ID with the Raspberry Pi Image Manager.")

    def repoint_image(self, payload: dict[str, Any]) -> None:
        old_url = normalize_image_url(str(payload.get("path") or ""))
        new_url = validate_image_reference(str(payload.get("replacementPath") or ""))
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
        raise ValueError("The website Site Manager never deletes image files. Delete artwork from the Raspberry Pi Image Manager instead.")




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
