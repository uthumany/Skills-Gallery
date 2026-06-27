#!/usr/bin/env python3
"""
Skills Gallery CLI — Browse 1,672+ AI agent skills from your terminal.
Compatible with 60+ AI agent tools.

Usage:
    skills-gallery              Interactive browser
    skg                         Short alias
    skills-gallery list          List all categories
    skills-gallery search <q>    Search skills
    skills-gallery category <c>  Browse a category
    skills-gallery stats         Show stats
"""

import json
import os
import sys
from pathlib import Path

try:
    import click
    HAS_CLICK = True
except ImportError:
    HAS_CLICK = False

DATA_DIR = Path(__file__).parent / "data"
CATALOG_PATH = Path(__file__).parent.parent / "data" / "skills-catalog.json"

BANNER = r"""
╔══════════════════════════╗
║  █▀▀ █▄▀ █ █▄▄ █▄▄ █▄▀ ║
║  ▀▀█ █ █ █ █▄▄ █▄▄ █▄▀ ║
║  ▀▀▀ ▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀ ║
║                          ║
║  █▀▀ █▀█ █▄▄ █▄▄ █▀▄ █▄█║
║  █▄█ █▀█ █▄▄ █▄▄ █▀▄  █ ║
║  ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀  ▀ ║
║                          ║
║   by uthuman Inc  ▾ ▸ ▴ ▴║
╚══════════════════════════╝
"""

SUBTITLE = "    1,672+ AI Agent Skills — 60+ Tools Compatible."
TAGLINE = "    npm · yarn · pnpm · bun · curl · pip · npx"


def load_catalog():
    for p in [CATALOG_PATH, DATA_DIR / "skills-catalog.json"]:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
    return None


def print_banner():
    print(BANNER)
    print(SUBTITLE)
    print(TAGLINE)
    print(f"    github.com/uthumany/Skills-Gallery\n")


def list_categories_plain(catalog):
    if not catalog:
        print("No catalog found.")
        return
    cats = catalog.get("categories", {})
    print(f"\n{'='*60}")
    print(f"  {catalog['total_skills']} skills across {len(cats)} categories")
    print(f"{'='*60}\n")
    for slug, cat in sorted(cats.items(), key=lambda x: x[1]["count"], reverse=True):
        print(f"  {cat['name']:<40} ({cat['count']} skills)")
    print()


def search_skills(catalog, query):
    if not catalog:
        print("No catalog found.")
        return
    q = query.lower()
    results = []
    for slug, cat in catalog.get("categories", {}).items():
        for skill in cat.get("skills", []):
            if q in skill["name"].lower() or q in skill.get("description", "").lower():
                results.append((cat["name"], skill))

    print(f"\n  Found {len(results)} skills matching '{query}':\n")
    for cat_name, skill in results:
        print(f"  [{cat_name}] {skill['name']}")
        print(f"    {skill.get('description', '')[:100]}\n")


def browse_category(catalog, cat_slug):
    if not catalog:
        print("No catalog found.")
        return
    cats = catalog.get("categories", {})
    cat = cats.get(cat_slug)
    if not cat:
        for slug, c in cats.items():
            if cat_slug.lower() in slug.lower() or cat_slug.lower() in c["name"].lower():
                cat = c
                break
    if not cat:
        print(f"Category '{cat_slug}' not found.")
        print("Available categories:")
        for slug, c in sorted(cats.items()):
            print(f"  {slug} — {c['name']} ({c['count']})")
        return

    print(f"\n{'='*60}")
    print(f"  {cat['name']} — {cat['count']} skills")
    print(f"  {cat.get('description', '')}")
    print(f"{'='*60}\n")
    for i, skill in enumerate(cat.get("skills", []), 1):
        print(f"  {i:4}. {skill['name']}")
        desc = skill.get("description", "")[:120]
        if desc:
            print(f"       {desc}")
    print()


# ---- Click CLI ----
if HAS_CLICK:

    @click.group(invoke_without_command=True)
    @click.version_option(version="2.0.0", prog_name="skills-gallery")
    @click.pass_context
    def main(ctx):
        """Skills Gallery — 1,672+ AI agent skills at your fingertips."""
        if ctx.invoked_subcommand is None:
            print_banner()
            catalog = load_catalog()
            if catalog:
                list_categories_plain(catalog)

    @main.command()
    def list():
        """List all skill categories."""
        catalog = load_catalog()
        list_categories_plain(catalog)

    @main.command()
    @click.argument("query")
    def search(query):
        """Search skills by name or description."""
        catalog = load_catalog()
        search_skills(catalog, query)

    @main.command()
    @click.argument("category")
    def category(category):
        """Browse skills in a category."""
        catalog = load_catalog()
        browse_category(catalog, category)

    @main.command()
    def stats():
        """Show gallery statistics."""
        catalog = load_catalog()
        if not catalog:
            print("No catalog found.")
            return
        cats = catalog.get("categories", {})
        print(f"\n  Skills Gallery v2.0.0 — by uthuman Inc")
        print(f"  Total Skills: {catalog['total_skills']}")
        print(f"  Categories:   {len(cats)}")
        print(f"  Compatible:   60+ AI Agent Tools")
        print(f"  GitHub:       github.com/uthumany/Skills-Gallery")
        print(f"  npm:          npm i -g skills-gallery")
        top = sorted(cats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]
        print(f"\n  Top 10 Categories:")
        for slug, cat in top:
            print(f"    {cat['name']:<35} {cat['count']} skills")

else:
    def main():
        print_banner()
        catalog = load_catalog()
        if catalog:
            list_categories_plain(catalog)


if __name__ == "__main__":
    main()
