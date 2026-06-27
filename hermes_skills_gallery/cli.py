#!/usr/bin/env python3
"""
Hermes Skills Gallery CLI — Browse 1,600+ Hermes Agent skills from your terminal.

Usage:
    hermes-skills              Interactive browser
    hermes-skills list          List all categories
    hermes-skills search <q>    Search skills
    hermes-skills category <c>  Browse a category
    hermes-skills install <n>   Install a skill via hermes CLI
    hsk                        Short alias
"""

import json
import os
import sys
from pathlib import Path

try:
    import click
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
    from rich import box
    from rich.columns import Columns
    from rich.prompt import Prompt, Confirm
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

DATA_DIR = Path(__file__).parent / "data"
CATALOG_PATH = DATA_DIR / "skills-catalog.json"

BANNER = r"""
╔══════════════════════════════════════════════════════════════╗
║  ██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗       ║
║  ██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝       ║
║  ███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗       ║
║  ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║       ║
║  ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║       ║
║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝       ║
║                                                              ║
║   ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗               ║
║   ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝               ║
║   ███████╗█████╔╝ ██║██║     ██║     ███████╗               ║
║   ╚════██║██╔═██╗ ██║██║     ██║     ╚════██║               ║
║   ███████║██║  ██╗██║███████╗███████╗███████║               ║
║   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝               ║
║                                                              ║
║              ██████╗  █████╗ ██╗     ██╗     ███████╗██████╗║
║             ██╔════╝ ██╔══██╗██║     ██║     ██╔════╝██╔══██║
║             ██║  ███╗███████║██║     ██║     █████╗  ██████╔╝║
║             ██║   ██║██╔══██║██║     ██║     ██╔══╝  ██╔══██╗║
║             ╚██████╔╝██║  ██║███████╗███████╗███████╗██║  ██║║
║              ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝║
╚══════════════════════════════════════════════════════════════╝
"""


def load_catalog():
    """Load the skills catalog JSON."""
    if CATALOG_PATH.exists():
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def print_banner():
    """Print the ASCII banner."""
    print(BANNER)
    print("    1,600+ AI Agent Skills — One Gallery. Every Category. Zero Friction.")
    print("    github.com/uthumany/Hermes-Skills-Gallery\n")


def list_categories_plain(catalog):
    """List categories in plain text."""
    if not catalog:
        print("No catalog found. Run from the repo root or install the package.")
        return
    cats = catalog.get("categories", {})
    print(f"\n{'='*60}")
    print(f"  {catalog['total_skills']} skills across {len(cats)} categories")
    print(f"{'='*60}\n")
    for slug, cat in sorted(cats.items(), key=lambda x: x[1]["count"], reverse=True):
        print(f"  {cat['name']:<40} ({cat['count']} skills)")
    print()


def search_skills(catalog, query):
    """Search skills by name or description."""
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
    """Browse skills in a category."""
    if not catalog:
        print("No catalog found.")
        return
    cats = catalog.get("categories", {})
    cat = cats.get(cat_slug)
    if not cat:
        # Fuzzy match
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


def install_skill(skill_name):
    """Install a skill using hermes CLI."""
    import subprocess
    print(f"\n  Installing skill: {skill_name}")
    print(f"  Run: hermes skills install {skill_name}")
    try:
        result = subprocess.run(
            ["hermes", "skills", "install", skill_name],
            capture_output=True, text=True, timeout=30
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
    except FileNotFoundError:
        print("  Hermes CLI not found. Install Hermes Agent first:")
        print("  curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash")
    except Exception as e:
        print(f"  Error: {e}")


# ---- Click CLI ----

@click.group(invoke_without_command=True)
@click.version_option(version="1.0.0", prog_name="hermes-skills-gallery")
@click.pass_context
def main(ctx):
    """Hermes Skills Gallery — 1,600+ AI agent skills at your fingertips."""
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
@click.argument("skill_name")
def install(skill_name):
    """Install a skill via Hermes CLI."""
    install_skill(skill_name)


@main.command()
def stats():
    """Show gallery statistics."""
    catalog = load_catalog()
    if not catalog:
        print("No catalog found.")
        return
    cats = catalog.get("categories", {})
    print(f"\n  Total Skills: {catalog['total_skills']}")
    print(f"  Categories:   {len(cats)}")
    print(f"  Package:      hermes-skills-gallery v1.0.0")
    print(f"  GitHub:       github.com/uthumany/Hermes-Skills-Gallery")
    top = sorted(cats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]
    print(f"\n  Top 10 Categories:")
    for slug, cat in top:
        print(f"    {cat['name']:<35} {cat['count']} skills")


if __name__ == "__main__":
    main()
