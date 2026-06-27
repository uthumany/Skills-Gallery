#!/usr/bin/env node

/**
 * Hermes Skills Gallery — Interactive CLI
 *
 * A visually stunning terminal app for browsing, discovering,
 * and installing skills for Hermes Agent by Nous Research.
 *
 * Uses only built-in Node.js modules — zero external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ─── Constants ───────────────────────────────────────────────────────────────
const CATALOG_PATH = path.join(__dirname, 'data', 'skills-catalog.json');
const VERSION = '1.0.1';

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  underline:'\x1b[4m',

  // Foreground
  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',

  // Bright foreground
  bRed:    '\x1b[91m',
  bGreen:  '\x1b[92m',
  bYellow: '\x1b[93m',
  bBlue:   '\x1b[94m',
  bMagenta:'\x1b[95m',
  bCyan:   '\x1b[96m',
  bWhite:  '\x1b[97m',

  // Background
  bgBlue:  '\x1b[44m',
  bgMagenta:'\x1b[45m',
  bgCyan:  '\x1b[46m',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function colorize(text, ...colors) {
  return colors.join('') + text + C.reset;
}

function pad(str, len) {
  return str + ' '.repeat(Math.max(0, len - stripAnsi(str).length));
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function box(text, color = C.bCyan) {
  const lines = text.split('\n');
  const width = Math.max(...lines.map(l => stripAnsi(l).length)) + 4;
  const top = color + '╭' + '─'.repeat(width - 2) + '╮' + C.reset;
  const bottom = color + '╰' + '─'.repeat(width - 2) + '╯' + C.reset;
  const body = lines.map(l => {
    const clean = stripAnsi(l);
    return color + '│' + C.reset + ' ' + l + ' '.repeat(width - clean.length - 3) + color + '│' + C.reset;
  }).join('\n');
  return top + '\n' + body + '\n' + bottom;
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Banner ──────────────────────────────────────────────────────────────────
const BANNER = `
${C.bMagenta}${C.bold}██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗${C.reset}
${C.magenta}${C.bold}██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝${C.reset}
${C.bMagenta}${C.bold}███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗${C.reset}
${C.magenta}${C.bold}██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║${C.reset}
${C.bMagenta}${C.bold}██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║${C.reset}
${C.magenta}${C.bold}╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝${C.reset}
${C.bCyan}${C.bold}   ╔══════════════════════════════════════════════╗${C.reset}
${C.bCyan}${C.bold}   ║${C.reset}     ${C.bWhite}Skills Gallery${C.reset} — ${C.dim}by Nous Research${C.reset}       ${C.bCyan}${C.bold}║${C.reset}
${C.bCyan}${C.bold}   ╚══════════════════════════════════════════════╝${C.reset}`;

// ─── Data Loading ────────────────────────────────────────────────────────────
function loadCatalog() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

// ─── UI Components ───────────────────────────────────────────────────────────
function renderSkillCard(skill, index) {
  const tagStr = skill.tags.map(t => colorize(`#${t}`, C.dim)).join(' ');
  const lines = [
    `${colorize(`[${String(index).padStart(2, '0')}]`, C.bYellow)} ${colorize(skill.name, C.bWhite, C.bold)} ${colorize(`v${skill.version}`, C.dim)}`,
    `    ${C.dim}${skill.description}${C.reset}`,
    `    ${tagStr}  ${colorize('by', C.dim)} ${skill.author}`,
    '',
  ];
  return lines.join('\n');
}

function renderCategoryHeader(category, count) {
  return `\n${colorize('┌' + '─'.repeat(58) + '┐', C.bCyan)}
${colorize('│', C.bCyan)} ${colorize(category.name, C.bWhite, C.bold)} ${colorize(`(${count} skills)`, C.dim)}${' '.repeat(Math.max(0, 56 - stripAnsi(category.name).length - String(count).length - 10))}${colorize('│', C.bCyan)}
${colorize('│', C.bCyan)} ${C.dim}${category.description}${C.reset}${' '.repeat(Math.max(0, 56 - stripAnsi(category.description).length))}${colorize('│', C.bCyan)}
${colorize('└' + '─'.repeat(58) + '┘', C.bCyan)}`;
}

// ─── Main Menu ───────────────────────────────────────────────────────────────
function showMainMenu(catalog) {
  clearScreen();
  console.log(BANNER);
  console.log('');

  const cats = Object.entries(catalog.categories);
  console.log(box(
    `${colorize('📂  Browse by Category', C.bYellow, C.bold)}\n\n` +
    cats.map(([key, cat], i) =>
      `  ${colorize(`[${i + 1}]`, C.bGreen)} ${cat.name.padEnd(30)} ${colorize(`(${Object.keys(cat.skills).length} skills)`, C.dim)}`
    ).join('\n') + '\n\n' +
    `  ${colorize('[F]', C.bGreen)} 🔥 Featured Skills          ${colorize('[S]', C.bGreen)} 🔍 Search\n` +
    `  ${colorize('[A]', C.bGreen)} 📋 All Skills               ${colorize('[I]', C.bGreen)} ℹ️  About\n` +
    `  ${colorize('[Q]', C.bGreen)} 🚪 Quit`,
    C.bCyan
  ));

  console.log('');
}

async function prompt(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

// ─── Category View ───────────────────────────────────────────────────────────
function showCategory(catalog, catKey) {
  clearScreen();
  const cat = catalog.categories[catKey];
  if (!cat) return false;

  console.log(BANNER);
  console.log('');
  console.log(renderCategoryHeader(cat, Object.keys(cat.skills).length));

  let idx = 1;
  const skillMap = {};
  for (const [key, skill] of Object.entries(cat.skills)) {
    console.log(renderSkillCard(skill, idx));
    skillMap[idx] = { key, skill };
    idx++;
  }

  console.log(colorize('─'.repeat(60), C.dim));
  console.log(`  ${colorize('[B]', C.bGreen)} Back to categories   ${colorize('[#]', C.bGreen)} Enter number to view skill details`);
  console.log('');

  return { skillMap, maxIdx: idx - 1 };
}

// ─── Skill Detail View ───────────────────────────────────────────────────────
function showSkillDetail(skillKey, skill, catalog) {
  clearScreen();
  console.log(BANNER);
  console.log('');

  const detailBox = box(
    `${colorize('✨  ' + skill.name, C.bYellow, C.bold)}\n\n` +
    `${colorize('Description:', C.bWhite, C.bold)}\n` +
    `  ${skill.description}\n\n` +
    `${colorize('Tags:', C.bWhite, C.bold)}  ${skill.tags.map(t => colorize('#' + t, C.bCyan)).join('  ')}\n` +
    `${colorize('Author:', C.bWhite, C.bold)} ${skill.author}\n` +
    `${colorize('Version:', C.bWhite, C.bold)} ${skill.version}\n\n` +
    `${colorize('Install Command:', C.bWhite, C.bold)}\n` +
    `  ${C.dim}${skill.install}${C.reset}`,
    C.bMagenta
  );

  console.log(detailBox);
  console.log('');
  console.log(`  ${colorize('[I]', C.bGreen)} Copy install command   ${colorize('[B]', C.bGreen)} Back   ${colorize('[M]', C.bGreen)} Main menu`);
  console.log('');
}

// ─── Featured View ───────────────────────────────────────────────────────────
function showFeatured(catalog) {
  clearScreen();
  console.log(BANNER);
  console.log('');

  console.log(box(
    `${colorize('🔥  Featured Skills', C.bYellow, C.bold)}\n\n` +
    `  ${C.dim}Hand-picked skills to get you started${C.reset}`,
    C.bYellow
  ));

  console.log('');

  const allSkills = getAllSkills(catalog);
  let idx = 1;
  const skillMap = {};
  for (const featuredKey of catalog.featured) {
    const skill = allSkills[featuredKey];
    if (skill) {
      console.log(renderSkillCard(skill, idx));
      skillMap[idx] = { key: featuredKey, skill };
      idx++;
    }
  }

  console.log(colorize('─'.repeat(60), C.dim));
  console.log(`  ${colorize('[B]', C.bGreen)} Back   ${colorize('[#]', C.bGreen)} Enter number to view skill details`);
  console.log('');

  return { skillMap, maxIdx: idx - 1 };
}

// ─── All Skills View ─────────────────────────────────────────────────────────
function showAllSkills(catalog) {
  clearScreen();
  console.log(BANNER);
  console.log('');

  const allSkills = getAllSkills(catalog);
  const entries = Object.entries(allSkills);

  console.log(box(
    `${colorize('📋  All Skills', C.bBlue, C.bold)}  ${colorize(`(${entries.length} total)`, C.dim)}`,
    C.bBlue
  ));

  console.log('');

  let idx = 1;
  const skillMap = {};
  for (const [key, skill] of entries) {
    console.log(renderSkillCard(skill, idx));
    skillMap[idx] = { key, skill };
    idx++;
  }

  console.log(colorize('─'.repeat(60), C.dim));
  console.log(`  ${colorize('[B]', C.bGreen)} Back   ${colorize('[#]', C.bGreen)} Enter number to view skill details`);
  console.log('');

  return { skillMap, maxIdx: idx - 1 };
}

// ─── Search View ─────────────────────────────────────────────────────────────
async function showSearch(catalog, rl) {
  clearScreen();
  console.log(BANNER);
  console.log('');

  console.log(box(
    `${colorize('🔍  Search Skills', C.bBlue, C.bold)}\n\n` +
    `  ${C.dim}Type a search term to find skills${C.reset}`,
    C.bBlue
  ));
  console.log('');

  const query = await prompt(rl, colorize('  Search > ', C.bGreen));
  if (!query || query.toLowerCase() === 'b') return null;

  const allSkills = getAllSkills(catalog);
  const q = query.toLowerCase();
  const results = Object.entries(allSkills).filter(([, skill]) =>
    skill.name.toLowerCase().includes(q) ||
    skill.description.toLowerCase().includes(q) ||
    skill.tags.some(t => t.toLowerCase().includes(q)) ||
    skill.author.toLowerCase().includes(q)
  );

  clearScreen();
  console.log(BANNER);
  console.log('');

  if (results.length === 0) {
    console.log(box(
      `${colorize('😔  No results found for:', C.yellow)}\n` +
      `    "${query}"\n\n` +
      `  ${C.dim}Try a different search term${C.reset}`,
      C.yellow
    ));
    console.log(`\n  ${colorize('[Any key]', C.green)} Back`);
    return null;
  }

  console.log(box(
    `${colorize('🔍  Search Results:', C.bBlue, C.bold)} ${colorize(`"${query}"`, C.bWhite)} ${colorize(`(${results.length} found)`, C.dim)}`,
    C.bBlue
  ));
  console.log('');

  let idx = 1;
  const skillMap = {};
  for (const [key, skill] of results) {
    console.log(renderSkillCard(skill, idx));
    skillMap[idx] = { key, skill };
    idx++;
  }

  console.log(colorize('─'.repeat(60), C.dim));
  console.log(`  ${colorize('[S]', C.bGreen)} New search   ${colorize('[B]', C.bGreen)} Back   ${colorize('[#]', C.bGreen)} Enter number for details`);
  console.log('');

  return { skillMap, maxIdx: idx - 1 };
}

// ─── About View ──────────────────────────────────────────────────────────────
function showAbout() {
  clearScreen();
  console.log(BANNER);
  console.log('');

  console.log(box(
    `${colorize('ℹ️  About Hermes Skills Gallery', C.bCyan, C.bold)}\n\n` +
    `${colorize('Version:', C.white, C.bold)}     ${VERSION}\n` +
    `${colorize('Author:', C.white, C.bold)}      Nous Research\n` +
    `${colorize('License:', C.white, C.bold)}     MIT\n` +
    `${colorize('Repository:', C.white, C.bold)}  github.com/uthumany/Hermes-Skills-Gallery\n\n` +
    `${C.dim}Hermes Skills Gallery is a curated collection of skills${C.reset}\n` +
    `${C.dim}for Hermes Agent. Browse, discover, and install skills${C.reset}\n` +
    `${C.dim}to extend your agent's capabilities.${C.reset}\n\n` +
    `${colorize('Install globally:', C.white, C.bold)}\n` +
    `  npm install -g hermes-skills-gallery\n\n` +
    `${colorize('Or run directly:', C.white, C.bold)}\n` +
    `  npx hermes-skills-gallery`,
    C.bCyan
  ));
  console.log(`\n  ${colorize('[Any key]', C.green)} Back to main menu`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAllSkills(catalog) {
  const all = {};
  for (const cat of Object.values(catalog.categories)) {
    Object.assign(all, cat.skills);
  }
  return all;
}

function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      execSync(`echo ${text.replace(/'/g, "''")} | clip`, { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      execSync(`echo '${text.replace(/'/g, "'\\''")}' | pbcopy`, { stdio: 'ignore' });
    } else {
      const proc = require('child_process').spawn('xclip', ['-selection', 'clipboard']);
      proc.stdin.write(text);
      proc.stdin.end();
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Main Loop ───────────────────────────────────────────────────────────────
async function main() {
  const catalog = loadCatalog();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  let currentView = 'main';
  let currentCatKey = null;
  let currentSkillMap = null;
  let currentMaxIdx = 0;

  function printPrompt() {
    process.stdout.write(colorize('\n  🌟 Choose > ', C.bGreen));
  }

  // Set up raw input handling for single-key navigation
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  const KEY_MAP = {
    main: async (key) => {
      const u = key.toUpperCase();
      const cats = Object.keys(catalog.categories);

      if (u === 'Q' || key === '\x03') {
        cleanup();
        return;
      }

      const num = parseInt(key);
      if (num >= 1 && num <= cats.length) {
        currentCatKey = cats[num - 1];
        const result = showCategory(catalog, currentCatKey);
        if (result) {
          currentView = 'category';
          currentSkillMap = result.skillMap;
          currentMaxIdx = result.maxIdx;
        }
      } else if (u === 'F') {
        const result = showFeatured(catalog);
        if (result) {
          currentView = 'list';
          currentSkillMap = result.skillMap;
          currentMaxIdx = result.maxIdx;
        }
      } else if (u === 'S') {
        const result = await showSearch(catalog, rl);
        if (result) {
          currentView = 'searchResults';
          currentSkillMap = result.skillMap;
          currentMaxIdx = result.maxIdx;
        } else {
          showMainMenu(catalog);
          currentView = 'main';
        }
      } else if (u === 'A') {
        const result = showAllSkills(catalog);
        if (result) {
          currentView = 'list';
          currentSkillMap = result.skillMap;
          currentMaxIdx = result.maxIdx;
        }
      } else if (u === 'I') {
        showAbout();
        currentView = 'about';
      }

      printPrompt();
    },

    category: (key) => {
      const u = key.toUpperCase();
      if (u === 'B') {
        showMainMenu(catalog);
        currentView = 'main';
        currentCatKey = null;
      } else if (u === 'M') {
        showMainMenu(catalog);
        currentView = 'main';
        currentCatKey = null;
      } else {
        const num = parseInt(key);
        if (num >= 1 && num <= currentMaxIdx && currentSkillMap[num]) {
          const { key: skKey, skill } = currentSkillMap[num];
          showSkillDetail(skKey, skill, catalog);
          currentView = 'detail';
          currentSkillKey = skKey;
        }
      }
      printPrompt();
    },

    list: (key) => {
      const u = key.toUpperCase();
      if (u === 'B') {
        showMainMenu(catalog);
        currentView = 'main';
      } else {
        const num = parseInt(key);
        if (num >= 1 && num <= currentMaxIdx && currentSkillMap[num]) {
          const { key: skKey, skill } = currentSkillMap[num];
          showSkillDetail(skKey, skill, catalog);
          currentView = 'detail';
          currentSkillKey = skKey;
        }
      }
      printPrompt();
    },

    searchResults: async (key) => {
      const u = key.toUpperCase();
      if (u === 'B') {
        showMainMenu(catalog);
        currentView = 'main';
      } else if (u === 'S') {
        const result = await showSearch(catalog, rl);
        if (result) {
          currentView = 'searchResults';
          currentSkillMap = result.skillMap;
          currentMaxIdx = result.maxIdx;
        } else {
          showMainMenu(catalog);
          currentView = 'main';
        }
      } else {
        const num = parseInt(key);
        if (num >= 1 && num <= currentMaxIdx && currentSkillMap[num]) {
          const { key: skKey, skill } = currentSkillMap[num];
          showSkillDetail(skKey, skill, catalog);
          currentView = 'detail';
          currentSkillKey = skKey;
        }
      }
      printPrompt();
    },

    detail: (key) => {
      const u = key.toUpperCase();
      if (u === 'B') {
        if (currentCatKey) {
          const result = showCategory(catalog, currentCatKey);
          if (result) {
            currentView = 'category';
            currentSkillMap = result.skillMap;
            currentMaxIdx = result.maxIdx;
          }
        } else {
          showMainMenu(catalog);
          currentView = 'main';
        }
      } else if (u === 'M') {
        showMainMenu(catalog);
        currentView = 'main';
        currentCatKey = null;
      } else if (u === 'I') {
        const allSkills = getAllSkills(catalog);
        const skill = allSkills[currentSkillKey];
        if (skill) {
          const copied = copyToClipboard(skill.install);
          if (copied) {
            process.stdout.write('\n' + colorize('  ✅ Install command copied to clipboard!', C.bGreen) + '\n');
          } else {
            process.stdout.write('\n' + colorize('  ⚠️  Could not copy to clipboard. Command:', C.yellow) + '\n');
            process.stdout.write('    ' + C.dim + skill.install + C.reset + '\n');
          }
        }
      }
      printPrompt();
    },

    about: (key) => {
      showMainMenu(catalog);
      currentView = 'main';
      printPrompt();
    },
  };

  let inputBuffer = '';
  let currentSkillKey = null;

  process.stdin.on('data', async (data) => {
    const str = data.toString();

    // Handle escape sequences
    if (str === '\x1b') {
      inputBuffer = str;
      return;
    }
    if (inputBuffer === '\x1b' && str === '[') {
      inputBuffer += str;
      return;
    }
    if (inputBuffer.startsWith('\x1b[')) {
      // Arrow keys etc. — we ignore them for simplicity
      inputBuffer = '';
      return;
    }

    const key = str.replace(/[\r\n]/g, '');
    inputBuffer = '';

    if (KEY_MAP[currentView]) {
      await KEY_MAP[currentView](key);
    }
  });

  function cleanup() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    rl.close();
    console.log(colorize('\n\n  👋 Thanks for browsing Hermes Skills Gallery!\n', C.bMagenta));
    process.exit(0);
  }

  // Handle SIGINT gracefully
  process.on('SIGINT', cleanup);

  // Show initial view
  showMainMenu(catalog);
  printPrompt();
}

// ─── Direct CLI Flags ────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log(`hermes-skills-gallery v${VERSION}`);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colorize('Hermes Skills Gallery', C.bMagenta, C.bold)} v${VERSION}
${C.dim}A curated collection of skills for Hermes Agent by Nous Research${C.reset}

${colorize('Usage:', C.bWhite, C.bold)}
  hermes-skills-gallery          Launch interactive browser
  hsg                            Short alias
  npx hermes-skills-gallery      Run without installing

${colorize('Options:', C.bWhite, C.bold)}
  --version, -v                  Show version
  --help, -h                     Show this help
  --list                         List all skills as JSON
  --category <name>              List skills in a specific category
  --search <query>               Search skills

${colorize('Examples:', C.bWhite, C.bold)}
  hermes-skills-gallery
  hermes-skills-gallery --list
  hermes-skills-gallery --category development
  hermes-skills-gallery --search docker
`);
  process.exit(0);
}

if (args.includes('--list')) {
  const catalog = loadCatalog();
  console.log(JSON.stringify(catalog, null, 2));
  process.exit(0);
}

const catIdx = args.indexOf('--category');
if (catIdx !== -1 && args[catIdx + 1]) {
  const catalog = loadCatalog();
  const catName = args[catIdx + 1];
  const cat = catalog.categories[catName];
  if (cat) {
    console.log(JSON.stringify(cat, null, 2));
  } else {
    console.error(`Category "${catName}" not found. Available: ${Object.keys(catalog.categories).join(', ')}`);
    process.exit(1);
  }
  process.exit(0);
}

const searchIdx = args.indexOf('--search');
if (searchIdx !== -1 && args[searchIdx + 1]) {
  const catalog = loadCatalog();
  const query = args[searchIdx + 1].toLowerCase();
  const allSkills = getAllSkills(catalog);
  const results = Object.entries(allSkills)
    .filter(([, s]) =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.tags.some(t => t.includes(query))
    )
    .map(([key, s]) => ({ key, ...s }));
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

// Launch interactive mode
main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
