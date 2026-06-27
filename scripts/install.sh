#!/usr/bin/env bash
#
# Hermes Skills Gallery — One-line installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/uthumany/Hermes-Skills-Gallery/master/scripts/install.sh | bash
#
# Or with npm:
#   npm install -g hermes-skills-gallery
#

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${MAGENTA}${BOLD}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${MAGENTA}${BOLD}║${RESET}     ${BOLD}Hermes Skills Gallery${RESET} — Installer         ${MAGENTA}${BOLD}║${RESET}"
echo -e "${MAGENTA}${BOLD}╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ─── Detect package manager ────────────────────────────────────────────
detect_package_manager() {
  if command -v npm &> /dev/null; then
    echo "npm"
  elif command -v yarn &> /dev/null; then
    echo "yarn"
  elif command -v pnpm &> /dev/null; then
    echo "pnpm"
  elif command -v bun &> /dev/null; then
    echo "bun"
  else
    echo ""
  fi
}

# ─── Check Node.js ─────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo -e "${RED}✖ Node.js is not installed.${RESET}"
  echo -e "  Please install Node.js >= 16 from ${CYAN}https://nodejs.org${RESET}"
  echo ""
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
echo -e "${GREEN}✔${RESET} Node.js $(node -v) detected"

if [ "$NODE_VERSION" -lt 16 ]; then
  echo -e "${YELLOW}⚠${RESET}  Node.js >= 16 recommended (you have v$(node -v))"
fi

# ─── Install ───────────────────────────────────────────────────────────
PM=$(detect_package_manager)

if [ -z "$PM" ]; then
  echo -e "${RED}✖ No package manager found.${RESET}"
  echo -e "  Please install npm, yarn, pnpm, or bun first."
  exit 1
fi

echo -e "${GREEN}✔${RESET} Using ${BOLD}${PM}${RESET} to install..."
echo ""

case "$PM" in
  npm)
    npm install -g hermes-skills-gallery
    ;;
  yarn)
    yarn global add hermes-skills-gallery
    ;;
  pnpm)
    pnpm add -g hermes-skills-gallery
    ;;
  bun)
    bun add -g hermes-skills-gallery
    ;;
esac

echo ""
echo -e "${GREEN}${BOLD}✅ Hermes Skills Gallery installed successfully!${RESET}"
echo ""
echo -e "  Run it with:  ${CYAN}hermes-skills-gallery${RESET}"
echo -e "  Or:           ${CYAN}hsg${RESET}"
echo -e "  Or via npx:   ${CYAN}npx hermes-skills-gallery${RESET}"
echo ""
echo -e "  ${YELLOW}🔗 GitHub:${RESET} https://github.com/uthumany/Hermes-Skills-Gallery"
echo ""
