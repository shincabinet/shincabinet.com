#!/usr/bin/env python3
"""Manage the Shin Cabinet page hierarchy without editing HTML by hand.

Examples:
  python3 tools/manage_pages.py list
  python3 tools/manage_pages.py enable about
  python3 tools/manage_pages.py disable commissions
  python3 tools/manage_pages.py create materials /fursuits/materials/ "Materials" --parent fursuits
  python3 tools/manage_pages.py move materials --parent root
  python3 tools/manage_pages.py set materials --menu off --footer on --home on
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
PAGES_FILE = ROOT / "config" / "pages.js"
CUSTOM_FILE = ROOT / "config" / "custom-pages.js"
TEMPLATE_FILE = ROOT / "tools" / "page-template.html"

PAGES_HEADER = """/*
  PAGE CONTROL CENTER
  -------------------
  This file is safely rewritten by tools/manage_pages.py.
  Change enabled/menu/footer/homeCard.show manually or use the management commands.
*/
"""
CUSTOM_HEADER = """/*
  CONTENT FOR GENERIC PAGES
  -------------------------
  This file is safely rewritten by tools/manage_pages.py.
  Edit the generated placeholder content whenever you create a new generic page.
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
    return variable, json.loads(text[start:end].strip())


def write_assignment(path: Path, variable: str, payload: dict[str, Any], header: str) -> None:
    rendered = json.dumps(payload, indent=2, ensure_ascii=False)
    path.write_text(f"{header}window.{variable} = {rendered};\n", encoding="utf-8")


def walk(items: Iterable[dict[str, Any]], parents: tuple[str, ...] = ()):
    for item in items:
        yield item, parents
        yield from walk(item.get("children", []), parents + (item["id"],))


def find(items: list[dict[str, Any]], page_id: str) -> dict[str, Any] | None:
    return next((item for item, _ in walk(items) if item.get("id") == page_id), None)


def remove(items: list[dict[str, Any]], page_id: str) -> dict[str, Any] | None:
    for index, item in enumerate(items):
        if item.get("id") == page_id:
            return items.pop(index)
        removed = remove(item.get("children", []), page_id)
        if removed:
            return removed
    return None


def descendants(item: dict[str, Any]) -> set[str]:
    result: set[str] = set()
    for child in item.get("children", []):
        result.add(child["id"])
        result.update(descendants(child))
    return result


def parse_on_off(value: str) -> bool:
    return value.lower() == "on"


def normalize_path(value: str) -> str:
    value = "/" + value.strip("/")
    return "/" if value == "/" else value + "/"


def page_folder(path: str) -> Path:
    clean = path.strip("/")
    if not clean:
        raise ValueError("The home path cannot be used for a generated page.")
    return ROOT / clean


def write_sitemap(payload: dict[str, Any]) -> None:
    base = payload.get("options", {}).get("siteUrl", "https://example.com").rstrip("/")
    urls: list[str] = []

    def collect(nodes: list[dict[str, Any]], parent_enabled: bool = True) -> None:
        for node in nodes:
            enabled = parent_enabled and node.get("enabled", True)
            if enabled:
                path = node.get("path", "/")
                urls.append(base + ("/" if path == "/" else path))
            collect(node.get("children", []), enabled)

    collect(payload.get("items", []))
    body = "".join(f"  <url><loc>{url}</loc></url>\n" for url in urls)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + body
        + '</urlset>\n'
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


def print_tree(items: list[dict[str, Any]], prefix: str = "") -> None:
    for item in items:
        state = "ON " if item.get("enabled", True) else "OFF"
        flags = []
        if item.get("menu", True):
            flags.append("menu")
        if item.get("footer", False):
            flags.append("footer")
        if item.get("homeCard", {}).get("show", False):
            flags.append("home")
        print(f"{prefix}[{state}] {item['id']:<18} {item['path']:<28} {item['label']} ({', '.join(flags) or 'unlisted'})")
        print_tree(item.get("children", []), prefix + "    ")


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage Shin Cabinet pages.")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="Show the full page hierarchy.")
    sub.add_parser("sync", help="Regenerate sitemap.xml from the current enabled hierarchy.")

    for command in ("enable", "disable"):
        cmd = sub.add_parser(command, help=f"{command.title()} a page while retaining its content.")
        cmd.add_argument("id")

    create = sub.add_parser("create", help="Create a generic page, hierarchy entry, and content stub.")
    create.add_argument("id")
    create.add_argument("path")
    create.add_argument("label")
    create.add_argument("--parent", default="root", help="Parent page ID, or root.")
    create.add_argument("--enabled", action="store_true", help="Publish immediately. Default is disabled.")
    create.add_argument("--no-menu", action="store_true")
    create.add_argument("--footer", action="store_true")
    create.add_argument("--home", action="store_true")

    move = sub.add_parser("move", help="Move an existing page under a different parent.")
    move.add_argument("id")
    move.add_argument("--parent", required=True, help="Parent page ID, or root.")

    set_cmd = sub.add_parser("set", help="Change page visibility flags or basic metadata.")
    set_cmd.add_argument("id")
    set_cmd.add_argument("--enabled", choices=("on", "off"))
    set_cmd.add_argument("--menu", choices=("on", "off"))
    set_cmd.add_argument("--footer", choices=("on", "off"))
    set_cmd.add_argument("--home", choices=("on", "off"))
    set_cmd.add_argument("--label")
    set_cmd.add_argument("--title")
    set_cmd.add_argument("--description")

    args = parser.parse_args()
    pages_variable, pages_payload = read_assignment(PAGES_FILE)
    custom_variable, custom_payload = read_assignment(CUSTOM_FILE)
    items = pages_payload["items"]

    if args.command == "list":
        print_tree(items)
        return 0

    if args.command == "sync":
        write_sitemap(pages_payload)
        print("Regenerated sitemap.xml")
        return 0

    if args.command in {"enable", "disable"}:
        page = find(items, args.id)
        if not page:
            parser.error(f"Unknown page ID: {args.id}")
        page["enabled"] = args.command == "enable"

    elif args.command == "create":
        if find(items, args.id):
            parser.error(f"Page ID already exists: {args.id}")
        path = normalize_path(args.path)
        if any(item.get("path") == path for item, _ in walk(items)):
            parser.error(f"Page path already exists: {path}")
        parent_items = items
        if args.parent != "root":
            parent = find(items, args.parent)
            if not parent:
                parser.error(f"Unknown parent page ID: {args.parent}")
            parent_items = parent.setdefault("children", [])

        page = {
            "id": args.id,
            "label": args.label,
            "path": path,
            "enabled": bool(args.enabled),
            "menu": not args.no_menu,
            "footer": bool(args.footer),
            "homeCard": {
                "show": bool(args.home),
                "order": 100,
                "eyebrow": "New cabinet section"
            },
            "title": f"{args.label} — Shin Cabinet",
            "description": f"{args.label} at Shin Cabinet.",
            "children": []
        }
        parent_items.append(page)

        folder = page_folder(path)
        folder.mkdir(parents=True, exist_ok=True)
        html_path = folder / "index.html"
        if html_path.exists():
            parser.error(f"Refusing to overwrite existing file: {html_path}")
        template = TEMPLATE_FILE.read_text(encoding="utf-8")
        html_path.write_text(template.replace("{{PAGE_ID}}", args.id), encoding="utf-8")

        custom_payload[args.id] = {
            "hero": {
                "eyebrow": f"Cabinet / {args.label}",
                "title": args.label,
                "intro": "Replace this introduction in config/custom-pages.js."
            },
            "sections": [
                {
                    "type": "text",
                    "eyebrow": "New file",
                    "title": "Start writing here",
                    "paragraphs": [
                        "This content remains saved even when the page is disabled.",
                        "Add more blocks using the text, cards, gallery, timeline, links, or callout section types."
                    ]
                }
            ]
        }

    elif args.command == "move":
        page = find(items, args.id)
        if not page:
            parser.error(f"Unknown page ID: {args.id}")
        if args.parent == args.id or args.parent in descendants(page):
            parser.error("A page cannot be moved under itself or one of its descendants.")
        page = remove(items, args.id)
        assert page is not None
        if args.parent == "root":
            items.append(page)
        else:
            parent = find(items, args.parent)
            if not parent:
                parser.error(f"Unknown parent page ID: {args.parent}")
            parent.setdefault("children", []).append(page)

    elif args.command == "set":
        page = find(items, args.id)
        if not page:
            parser.error(f"Unknown page ID: {args.id}")
        for field in ("enabled", "menu", "footer"):
            value = getattr(args, field)
            if value is not None:
                page[field] = parse_on_off(value)
        if args.home is not None:
            page.setdefault("homeCard", {})["show"] = parse_on_off(args.home)
        for field in ("label", "title", "description"):
            value = getattr(args, field)
            if value is not None:
                page[field] = value

    write_assignment(PAGES_FILE, pages_variable, pages_payload, PAGES_HEADER)
    write_assignment(CUSTOM_FILE, custom_variable, custom_payload, CUSTOM_HEADER)
    write_sitemap(pages_payload)
    print(f"Updated {PAGES_FILE.relative_to(ROOT)}")
    if args.command == "create":
        print(f"Created {normalize_path(args.path)} and a content stub in config/custom-pages.js")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
