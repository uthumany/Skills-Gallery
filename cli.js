#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CATALOG_PATH = path.join(__dirname, 'data', 'skills-catalog.json');
const PKG = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = PKG.version;

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', white: '\x1b[37m', gray: '\x1b[90m',
  bRed: '\x1b[91m', bGreen: '\x1b[92m', bYellow: '\x1b[93m',
  bBlue: '\x1b[94m', bMagenta: '\x1b[95m', bCyan: '\x1b[96m', bWhite: '\x1b[97m',
};

function color(text, ...codes) { return codes.join('') + text + C.reset; }
function strip(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }
function clear() { process.stdout.write('\x1b[2J\x1b[H'); }

function box(text, borderColor) {
  borderColor = borderColor || C.bCyan;
  const lines = text.split('\n');
  const w = Math.max(...lines.map(l => strip(l).length)) + 4;
  const top = borderColor + '╭' + '─'.repeat(w - 2) + '╮' + C.reset;
  const bot = borderColor + '╰' + '─'.repeat(w - 2) + '╯' + C.reset;
  const body = lines.map(l => {
    const c = strip(l);
    return borderColor + '│' + C.reset + ' ' + l + ' '.repeat(w - c.length - 3) + borderColor + '│' + C.reset;
  }).join('\n');
  return top + '\n' + body + '\n' + bot;
}

const BANNER = `
${C.bMagenta}${C.bold}██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗${C.reset}
${C.magenta}${C.bold}██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝${C.reset}
${C.bMagenta}${C.bold}███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗${C.reset}
${C.magenta}${C.bold}██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║${C.reset}
${C.bMagenta}${C.bold}██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║${C.reset}
${C.magenta}${C.bold}╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝${C.reset}
${C.bCyan}${C.bold}   ╔══════════════════════════════════════════════╗${C.reset}
${C.bCyan}${C.bold}   ║${C.reset}     ${C.bWhite}Skills Gallery${C.reset} — ${C.dim}Uthuman & Co${C.reset}       ${C.bCyan}${C.bold}║${C.reset}
${C.bCyan}${C.bold}   ╚══════════════════════════════════════════════╝${C.reset}
   ${color('1,672+ AI Agent Skills — One Gallery. Every Category.', C.bWhite)}
   ${color('npm · yarn · pnpm · bun · curl · pip · npx', C.dim)}
`;

function loadCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function showMainMenu(catalog) {
  clear();
  console.log(BANNER);
  console.log('');
  const cats = Object.entries(catalog.categories).sort((a, b) => b[1].count - a[1].count);
  
  let menu = color('📂  Browse by Category', C.bYellow, C.bold) + '\n\n';
  for (let i = 0; i < Math.min(cats.length, 20); i++) {
    const [key, cat] = cats[i];
    menu += `  ${color(`[${String(i+1).padStart(2)}]`, C.bGreen)} ${cat.name.padEnd(30)} ${color(`(${cat.count} skills)`, C.dim)}\n`;
  }
  if (cats.length > 20) {
    menu += `  ${color('...', C.dim)} ${color(`+${cats.length - 20} more categories`, C.dim)}\n`;
  }
  menu += `\n  ${color('[S]', C.bGreen)} 🔍 Search Skills\n`;
  menu += `  ${color('[L]', C.bGreen)} 📋 List All Categories\n`;
  menu += `  ${color('[I]', C.bGreen)} ℹ️  Info & Stats\n`;
  menu += `  ${color('[Q]', C.bGreen)} 🚪 Quit`;
  console.log(box(menu, C.bCyan));
  console.log('');
  return { cats, totalCategories: cats.length };
}

function showCategoryView(catalog, catKey) {
  clear();
  const cat = catalog.categories[catKey];
  if (!cat) return false;
  console.log(BANNER);
  console.log('');
  console.log(box(
    `${color(cat.name, C.bWhite, C.bold)}\n` +
    `${color(cat.description || '', C.dim)}\n` +
    `${color(`${cat.count} skills`, C.bYellow)}`,
    C.bCyan
  ));
  console.log('');
  const skills = cat.skills || [];
  for (let i = 0; i < Math.min(skills.length, 15); i++) {
    const s = skills[i];
    console.log(`  ${color(`[${String(i+1).padStart(3)}]`, C.bYellow)} ${color(s.name, C.bWhite, C.bold)}`);
    if (s.description) {
      const desc = s.description.length > 100 ? s.description.slice(0, 100) + '...' : s.description;
      console.log(`       ${color(desc, C.dim)}`);
    }
  }
  if (skills.length > 15) {
    console.log(`  ${color(`... +${skills.length - 15} more skills`, C.dim)}`);
  }
  console.log('');
  console.log(color('  [B] Back  [I <name>] Install  [Q] Quit', C.gray));
  return true;
}

function searchSkills(catalog, query) {
  const q = query.toLowerCase();
  const results = [];
  for (const [catKey, cat] of Object.entries(catalog.categories)) {
    for (const skill of (cat.skills || [])) {
      if (skill.name.toLowerCase().includes(q) || (skill.description || '').toLowerCase().includes(q)) {
        results.push({ category: cat.name, catKey, ...skill });
      }
    }
  }
  return results;
}

function showSearchResults(catalog, query) {
  clear();
  const results = searchSkills(catalog, query);
  console.log(BANNER);
  console.log('');
  console.log(box(
    `${color(`🔍  Search: "${query}"`, C.bYellow, C.bold)}\n` +
    `${color(`Found ${results.length} skills`, C.dim)}`,
    C.bCyan
  ));
  console.log('');
  for (let i = 0; i < Math.min(results.length, 20); i++) {
    const r = results[i];
    console.log(`  ${color(`[${String(i+1).padStart(2)}]`, C.bYellow)} ${color(r.name, C.bWhite, C.bold)} ${color(`[${r.category}]`, C.dim)}`);
    if (r.description) {
      const desc = r.description.length > 90 ? r.description.slice(0, 90) + '...' : r.description;
      console.log(`       ${color(desc, C.dim)}`);
    }
  }
  if (results.length > 20) {
    console.log(`  ${color(`... +${results.length - 20} more results`, C.dim)}`);
  }
  console.log('');
  console.log(color('  [B] Back  [N] New search  [I <name>] Install  [Q] Quit', C.gray));
  return results;
}

function showInfo(catalog) {
  clear();
  console.log(BANNER);
  console.log('');
  const cats = Object.entries(catalog.categories);
  console.log(box(
    `${color('ℹ️  Hermes Skills Gallery', C.bWhite, C.bold)}\n\n` +
    `${color('Total Skills:', C.gray)}  ${color(String(catalog.total_skills), C.bGreen, C.bold)}\n` +
    `${color('Categories:', C.gray)}   ${color(String(cats.length), C.bYellow, C.bold)}\n` +
    `${color('Version:', C.gray)}      ${color(VERSION, C.dim)}\n` +
    `${color('GitHub:', C.gray)}      ${color('github.com/uthumany/Hermes-Skills-Gallery', C.blue)}\n` +
    `${color('npm:', C.gray)}         ${color('npm i -g hermes-skills-gallery', C.dim)}`,
    C.bCyan
  ));
  console.log('');
}

function installSkill(name) {
  clear();
  console.log(BANNER);
  console.log('');
  console.log(box(
    `${color('📦  Install Skill', C.bYellow, C.bold)}\n\n` +
    `${color(name, C.bWhite, C.bold)}\n\n` +
    `${color('Run this command in your terminal:', C.gray)}\n` +
    `${color(`  hermes skills install ${name}`, C.bGreen, C.bold)}`,
    C.bCyan
  ));
  console.log('');
}

async function ask(rl, question, defaultVal) {
  const prompt = defaultVal !== undefined
    ? `${question} [${color(defaultVal, C.yellow)}]: `
    : `${question}: `;
  return new Promise(resolve => {
    rl.question(prompt, answer => resolve(answer.trim() || (defaultVal || '')));
  });
}

async function interactive(catalog) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  let currentView = 'main';
  let currentCatKey = null;
  let searchQuery = null;

  while (true) {
    if (currentView === 'category' && currentCatKey) {
      showCategoryView(catalog, currentCatKey);
      const cmd = (await ask(rl, '\n  Choice')).toUpperCase();
      if (cmd === 'B' || cmd === 'BACK') { currentView = 'main'; continue; }
      if (cmd === 'Q' || cmd === 'QUIT') break;
      if (cmd.startsWith('I ')) { installSkill(cmd.slice(2)); await ask(rl, '\n  Press Enter to continue', ''); continue; }
      continue;
    }
    if (currentView === 'search') {
      showSearchResults(catalog, searchQuery || '');
      const cmd = (await ask(rl, '\n  Choice')).toUpperCase();
      if (cmd === 'B' || cmd === 'BACK') { currentView = 'main'; continue; }
      if (cmd === 'N' || cmd === 'NEW') {
        searchQuery = await ask(rl, '\n  Search for');
        continue;
      }
      if (cmd === 'Q' || cmd === 'QUIT') break;
      if (cmd.startsWith('I ')) { installSkill(cmd.slice(2)); await ask(rl, '\n  Press Enter to continue', ''); continue; }
      continue;
    }
    
    const { cats } = showMainMenu(catalog);
    const cmd = (await ask(rl, '\n  Choice')).toUpperCase();
    
    if (cmd === 'Q' || cmd === 'QUIT') break;
    if (cmd === 'I' || cmd === 'INFO') { showInfo(catalog); await ask(rl, '\n  Press Enter to continue', ''); continue; }
    if (cmd === 'S' || cmd === 'SEARCH') {
      searchQuery = await ask(rl, '\n  Search for');
      currentView = 'search';
      continue;
    }
    if (cmd === 'L' || cmd === 'LIST') {
      clear();
      console.log(BANNER);
      console.log('');
      let list = color('📋  All Categories', C.bWhite, C.bold) + '\n\n';
      const sorted = Object.entries(catalog.categories).sort((a, b) => b[1].count - a[1].count);
      for (const [key, cat] of sorted) {
        list += `  ${color(cat.name.padEnd(30), C.bWhite)} ${color(`(${cat.count} skills)`, C.dim)}\n`;
      }
      console.log(box(list, C.bCyan));
      await ask(rl, '\n  Press Enter to continue', '');
      continue;
    }
    
    const num = parseInt(cmd);
    if (num >= 1 && num <= cats.length) {
      currentCatKey = cats[num - 1][0];
      currentView = 'category';
      continue;
    }
  }
  rl.close();
  clear();
  console.log(BANNER);
  console.log(color('\n  Thanks for using Hermes Skills Gallery!\n', C.bGreen));
}

// ─── CLI Flag Mode ──────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = args[0] || '';

if (flag === '--help' || flag === '-h') {
  console.log(`Hermes Skills Gallery v${VERSION}`);
  console.log('');
  console.log('Usage:');
  console.log('  hermes-skills-gallery              Interactive browser');
  console.log('  hermes-skills-gallery --list       List full catalog as JSON');
  console.log('  hermes-skills-gallery --category <name>  Show a category');
  console.log('  hermes-skills-gallery --search <query>   Search skills');
  console.log('  hermes-skills-gallery --stats            Show stats');
  process.exit(0);
}

if (flag === '--version' || flag === '-v') {
  console.log(VERSION);
  process.exit(0);
}

const catalog = loadCatalog();

if (flag === '--list') {
  console.log(JSON.stringify(catalog, null, 2));
  process.exit(0);
}

if (flag === '--stats') {
  const cats = Object.entries(catalog.categories);
  console.log(`Total Skills:  ${catalog.total_skills}`);
  console.log(`Categories:    ${cats.length}`);
  console.log(`Version:       ${VERSION}`);
  console.log(`\nTop Categories:`);
  cats.sort((a, b) => b[1].count - a[1].count).slice(0, 10).forEach(([k, c]) => {
    console.log(`  ${c.name.padEnd(30)} ${c.count} skills`);
  });
  process.exit(0);
}

if (flag === '--search' && args[1]) {
  const results = searchSkills(catalog, args[1]);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

if (flag === '--category' && args[1]) {
  const q = args[1].toLowerCase();
  let match = null;
  for (const [key, cat] of Object.entries(catalog.categories)) {
    if (key.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
      match = { key, ...cat };
      break;
    }
  }
  if (match) {
    console.log(JSON.stringify(match, null, 2));
  } else {
    console.error(`Category "${args[1]}" not found.`);
    console.error('Available:', Object.keys(catalog.categories).join(', '));
    process.exit(1);
  }
  process.exit(0);
}

// No flags -> interactive mode
interactive(catalog).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
