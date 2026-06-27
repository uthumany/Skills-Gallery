#!/usr/bin/env bash
# =============================================================================
# Skills Gallery — One-Line Installer (by uthuman Inc)
# =============================================================================
# Install 1,672+ AI agent skills in one command. Compatible with 60+ tools.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/uthumany/Skills-Gallery/master/scripts/install.sh | bash
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

REPO_URL="https://github.com/uthumany/Skills-Gallery.git"
REPO_DIR="$HOME/.skills-gallery"
PACKAGE_MANAGER="${1:-auto}"

banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════╗"
    echo "║  █▀▀ █▄▀ █ █▄▄ █▄▄ █▄▀ ║"
    echo "║  ▀▀█ █ █ █ █▄▄ █▄▄ █▄▀ ║"
    echo "║  ▀▀▀ ▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀ ║"
    echo "║                          ║"
    echo "║  █▀▀ █▀█ █▄▄ █▄▄ █▀▄ █▄█║"
    echo "║  █▄█ █▀█ █▄▄ █▄▄ █▀▄  █ ║"
    echo "║  ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀  ▀ ║"
    echo "║                          ║"
    echo "║   by uthuman Inc  ▾ ▸ ▴ ▴║"
    echo "╚══════════════════════════╝"
    echo -e "${NC}"
    echo -e "${BOLD}  1,672+ AI Agent Skills — 60+ Tools Compatible${NC}"
    echo ""
}

detect_pm() {
    if command -v bun &>/dev/null; then echo "bun"
    elif command -v pnpm &>/dev/null; then echo "pnpm"
    elif command -v yarn &>/dev/null; then echo "yarn"
    elif command -v npm &>/dev/null; then echo "npm"
    else echo ""; fi
}

install_via_npm() {
    echo -e "${GREEN}→ Installing via npm...${NC}"
    npm install -g skills-gallery
}

install_via_yarn() {
    echo -e "${GREEN}→ Installing via yarn...${NC}"
    yarn global add skills-gallery
}

install_via_pnpm() {
    echo -e "${GREEN}→ Installing via pnpm...${NC}"
    pnpm add -g skills-gallery
}

install_via_bun() {
    echo -e "${GREEN}→ Installing via bun...${NC}"
    bun add -g skills-gallery
}

install_via_pip() {
    echo -e "${GREEN}→ Installing via pip...${NC}"
    pip install skills-gallery
}

install_via_uv() {
    echo -e "${GREEN}→ Installing via uv...${NC}"
    uv tool install skills-gallery
}

install_via_curl() {
    echo -e "${GREEN}→ Cloning repo...${NC}"
    if [ -d "$REPO_DIR" ]; then
        cd "$REPO_DIR" && git pull origin master
    else
        git clone "$REPO_URL" "$REPO_DIR"
    fi
    echo -e "${GREEN}✓ Repo at $REPO_DIR${NC}"
    echo "  cd $REPO_DIR && pip install -e ."
    echo "  skills-gallery list"
}

banner

if [ "$PACKAGE_MANAGER" = "auto" ]; then
    PACKAGE_MANAGER=$(detect_pm)
fi

case "$PACKAGE_MANAGER" in
    npm)    install_via_npm ;;
    yarn)   install_via_yarn ;;
    pnpm)   install_via_pnpm ;;
    bun)    install_via_bun ;;
    pip)    install_via_pip ;;
    uv)     install_via_uv ;;
    python) install_via_pip ;;
    curl)   install_via_curl ;;
    *)      install_via_curl ;;
esac

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Skills Gallery installed!        ║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  skills-gallery list   — Categories  ║${NC}"
echo -e "${GREEN}║  skills-gallery search — Find skills ║${NC}"
echo -e "${GREEN}║  skills-gallery stats  — Stats       ║${NC}"
echo -e "${GREEN}║  skg                    — Short alias║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  github.com/uthumany/Skills-Gallery  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
