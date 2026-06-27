#!/usr/bin/env node
'use strict';

/**
 * Skills Gallery CLI v3.0.0 — TUI-Enhanced Terminal Browser
 * =========================================================
 * Features:
 *  - 1,672+ Skills + 9,185+ MCP Servers
 *  - One-command MCP server installer
 *  - TUI-inspired components: tabs, panels, gauges, progress bars, tables
 *  - 7 color themes: Dark, Catppuccin, Tokyo, Dracula, Nord, Gruvbox, Solarized
 *  - Interactive keyboard navigation (vim-style)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const CATALOG_PATH = path.join(__dirname, 'data', 'skills-catalog.json');
const MCP_PATH = path.join(__dirname, 'data', 'mcp-servers.json');
const PKG = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = PKG.version;

// ─── Themes (7 color schemes from tui.builders) ─────────────────────────────
const THEMES = {
  dark: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[36m', secondary: '\x1b[35m', accent: '\x1b[33m',
    success: '\x1b[32m', danger: '\x1b[31m', warning: '\x1b[93m',
    muted: '\x1b[90m', border: '\x1b[36m', highlight: '\x1b[46m\x1b[30m',
  },
  dracula: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[35m', secondary: '\x1b[36m', accent: '\x1b[33m',
    success: '\x1b[92m', danger: '\x1b[91m', warning: '\x1b[93m',
    muted: '\x1b[90m', border: '\x1b[35m', highlight: '\x1b[45m\x1b[37m',
  },
  tokyo: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[94m', secondary: '\x1b[34m', accent: '\x1b[33m',
    success: '\x1b[32m', danger: '\x1b[31m', warning: '\x1b[93m',
    muted: '\x1b[90m', border: '\x1b[94m', highlight: '\x1b[44m\x1b[37m',
  },
  nord: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[94m', secondary: '\x1b[36m', accent: '\x1b[33m',
    success: '\x1b[32m', danger: '\x1b[91m', warning: '\x1b[93m',
    muted: '\x1b[37m', border: '\x1b[94m', highlight: '\x1b[44m\x1b[37m',
  },
  catppuccin: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[95m', secondary: '\x1b[94m', accent: '\x1b[33m',
    success: '\x1b[92m', danger: '\x1b[91m', warning: '\x1b[93m',
    muted: '\x1b[37m', border: '\x1b[95m', highlight: '\x1b[45m\x1b[37m',
  },
  gruvbox: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[33m', secondary: '\x1b[32m', accent: '\x1b[31m',
    success: '\x1b[32m', danger: '\x1b[91m', warning: '\x1b[93m',
    muted: '\x1b[90m', border: '\x1b[33m', highlight: '\x1b[43m\x1b[30m',
  },
  solarized: {
    bg: '', fg: '\x1b[37m',
    primary: '\x1b[36m', secondary: '\x1b[34m', accent: '\x1b[33m',
    success: '\x1b[92m', danger: '\x1b[91m', warning: '\x1b[93m',
    muted: '\x1b[37m', border: '\x1b[36m', highlight: '\x1b[46m\x1b[37m',
  },
};

let T = THEMES.dark; // current theme

function setTheme(name) {
  if (THEMES[name]) { T = THEMES[name]; return true; }
  return false;
}

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', italic: '\x1b[3m',
  underline: '\x1b[4m', blink: '\x1b[5m', reverse: '\x1b[7m', hidden: '\x1b[8m',
};

function c(text, ...codes) { return codes.join('') + text + C.reset; }
function strip(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }
function clear() { process.stdout.write('\x1b[2J\x1b[H'); }
function cursorTo(x, y) { process.stdout.write(`\x1b[${y};${x}H`); }
function hideCursor() { process.stdout.write('\x1b[?25l'); }
function showCursor() { process.stdout.write('\x1b[?25h'); }

// ─── TUI Widgets ────────────────────────────────────────────────────────────

function box(text, opts = {}) {
  const borderColor = opts.border || T.border;
  const pad = opts.pad || 1;
  const title = opts.title || '';
  const lines = text.split('\n');
  const w = Math.max(...lines.map(l => strip(l).length), title ? strip(title).length + 4 : 0) + pad * 2 + 2;
  
  let top = borderColor;
  if (title) {
    top += '╭─ ' + title + ' ' + '─'.repeat(Math.max(0, w - strip(title).length - 4)) + '╮';
  } else {
    top += '╭' + '─'.repeat(w - 2) + '╮';
  }
  top += C.reset;

  const bot = borderColor + '╰' + '─'.repeat(w - 2) + '╯' + C.reset;
  const space = ' '.repeat(pad);
  const body = lines.map(l => {
    const clean = strip(l);
    return borderColor + '│' + C.reset + space + l + ' '.repeat(w - clean.length - 2 - pad * 2) + space + borderColor + '│' + C.reset;
  }).join('\n');
  return top + '\n' + body + '\n' + bot;
}

function panel(title, content, opts = {}) {
  return box(content, { ...opts, title });
}

function divider(width = 60, char = '─') {
  return T.muted + char.repeat(width) + C.reset;
}

function progressBar(value, max, width = 30) {
  const pct = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = T.success + '█'.repeat(filled) + T.muted + '░'.repeat(empty) + C.reset;
  const label = ` ${Math.round(pct * 100)}%`;
  return bar + label;
}

function gauge(value, max, label, width = 20) {
  return `${label.padEnd(16)} ${progressBar(value, max, width)}`;
}

function table(headers, rows, opts = {}) {
  const colWidths = headers.map((h, i) => {
    const vals = rows.map(r => strip(String(r[i] || '')));
    return Math.max(strip(h).length, ...vals.map(v => v.length)) + 2;
  });
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + headers.length + 1;
  
  // Header
  let out = T.border + '┌' + '┬'.repeat(totalWidth - 2).replace(/┬/g, (_, i) => {
    const boundary = colWidths.slice(0, -1).reduce((acc, w, j) => acc + (i === acc + w + j ? 1 : 0), 0);
    return i === 0 ? '─' : (boundary ? '┬' : '─');
  }) + '┐' + C.reset + '\n';
  
  out += T.border + '│' + C.reset;
  headers.forEach((h, i) => {
    out += ' ' + c(h, T.primary, C.bold) + ' '.repeat(colWidths[i] - strip(h).length - 1) + T.border + '│' + C.reset;
  });
  out += '\n';
  
  out += T.border + '├' + '┼'.repeat(totalWidth - 2) + '┤' + C.reset + '\n';
  
  rows.forEach(row => {
    out += T.border + '│' + C.reset;
    row.forEach((cell, i) => {
      const val = String(cell || '');
      out += ' ' + val + ' '.repeat(colWidths[i] - strip(val).length - 1) + T.border + '│' + C.reset;
    });
    out += '\n';
  });
  
  out += T.border + '└' + '┴'.repeat(totalWidth - 2) + '┘' + C.reset;
  return out;
}

function tabs(items, active) {
  let out = '';
  items.forEach((item, i) => {
    if (i === active) {
      out += ' ' + c(` ${item} `, T.highlight, C.bold) + ' ';
    } else {
      out += ' ' + c(` ${item} `, T.muted) + ' ';
    }
  });
  return out + '\n' + T.border + '─'.repeat(60) + C.reset;
}

function sparkline(values, width = 30, height = 3) {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const chars = '▁▂▃▄▅▆▇█';
  
  let out = '';
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < Math.min(values.length, width); x++) {
      const val = (values[x] - min) / range;
      const targetY = Math.round(val * (height - 1));
      if (targetY === y) out += T.primary + '█' + C.reset;
      else if (targetY > y) out += T.primary + '█' + C.reset;
      else out += ' ';
    }
    out += '\n';
  }
  return out;
}

// ─── ASCII Art Banners ──────────────────────────────────────────────────────

const BANNER_SKILLS = [
  c('╔══════════════════════════╗', T.border),
  c('║  █▀▀ █▄▀ █ █▄▄ █▄▄ █▄▀ ║', T.primary, C.bold),
  c('║  ▀▀█ █ █ █ █▄▄ █▄▄ █▄▀ ║', T.primary),
  c('║  ▀▀▀ ▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀ ║', T.primary),
  c('║                          ║', T.border),
  c('║  █▀▀ █▀█ █▄▄ █▄▄ █▀▄ █▄█║', T.secondary, C.bold),
  c('║  █▄█ █▀█ █▄▄ █▄▄ █▀▄  █ ║', T.secondary),
  c('║  ▀▀▀ ▀ ▀ ▀▀▀ ▀▀▀ ▀ ▀  ▀ ║', T.secondary),
  c('║                          ║', T.border),
  c('║   by uthuman Inc  ▾ ▸ ▴ ▴║', C.dim),
  c('╚══════════════════════════╝', T.border),
].join('\n');

const BANNER_MCP = [
  c('╔══════════════════════════════════════╗', T.border),
  c('║  ███╗   ███╗ ██████╗██████╗          ║', T.primary, C.bold),
  c('║  ████╗ ████║██╔════╝██╔══██╗         ║', T.primary),
  c('║  ██╔████╔██║██║     ██████╔╝         ║', T.primary),
  c('║  ██║╚██╔╝██║██║     ██╔═══╝          ║', T.primary),
  c('║  ██║ ╚═╝ ██║╚██████╗██║              ║', T.primary),
  c('║  ╚═╝     ╚═╝ ╚═════╝╚═╝              ║', T.primary),
  c('║                                      ║', T.border),
  c('║  ███████╗███████╗██████╗ ██╗   ██╗   ║', T.secondary, C.bold),
  c('║  ██╔════╝██╔════╝██╔══██╗██║   ██║   ║', T.secondary),
  c('║  ███████╗█████╗  ██████╔╝██║   ██║   ║', T.secondary),
  c('║  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝   ║', T.secondary),
  c('║  ███████║███████╗██║  ██║ ╚████╔╝    ║', T.secondary),
  c('║  ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝     ║', T.secondary),
  c('║                                      ║', T.border),
  c('║         by uthuman Inc  ▾ ▸ ▴ ▴      ║', C.dim),
  c('╚══════════════════════════════════════╝', T.border),
].join('\n');

// ─── Data Loading ───────────────────────────────────────────────────────────
function loadCatalog() {
  try { return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')); }
  catch { return null; }
}

function loadMCP() {
  try { return JSON.parse(fs.readFileSync(MCP_PATH, 'utf8')); }
  catch { return { total: 0, categories: {}, all_servers: [] }; }
}

// ─── MCP Server Installer ──────────────────────────────────────────────────
function installMCPServers(servers) {
  clear();
  console.log(BANNER_MCP);
  console.log('');
  console.log(panel('📦 MCP Server Installer', 
    c(`Installing ${servers.length} MCP servers...`, T.accent)
  ));
  console.log('');
  
  let installed = 0;
  let failed = 0;
  
  for (const srv of servers) {
    const name = srv.name || srv;
    console.log(`  ${c('▸', T.primary)} ${name}`);
    try {
      if (srv.github || srv.url) {
        const target = srv.github || srv.url;
        execSync(`hermes mcp add "${name}" --url "${target}"`, { 
          stdio: 'pipe', timeout: 15000 
        });
        console.log(`    ${c('✓ installed', T.success)}`);
        installed++;
      }
    } catch (e) {
      console.log(`    ${c('✗ failed', T.danger)}`);
      failed++;
    }
  }
  
  console.log('');
  console.log(panel('Results', 
    `${c(`✓ ${installed} installed`, T.success)}\n` +
    `${failed > 0 ? c(`✗ ${failed} failed`, T.danger) + '\n' : ''}` +
    `Run: ${c('hermes mcp list', T.accent)} to verify`
  ));
}

// ─── Views ──────────────────────────────────────────────────────────────────

function showMainMenu(catalog, mcp) {
  clear();
  console.log(BANNER_SKILLS);
  console.log(`  ${c('1,672 Skills + 9,185 MCP Servers', T.accent, C.bold)}`);
  console.log(`  ${c('npm · yarn · pnpm · bun · curl · pip · npx', C.dim)}`);
  console.log('');
  
  const activeTab = 0;
  console.log(tabs(['📂 Skills', '🔌 MCP Servers', '🎨 Themes', '⚙️ Settings'], activeTab));
  console.log('');
  
  const cats = Object.entries(catalog ? catalog.categories : {}).sort((a, b) => b[1].count - a[1].count);
  const mcpCats = Object.entries(mcp.categories || {}).sort((a, b) => b[1].count - a[1].count);
  
  // Skills panel
  let skillsPanel = '';
  for (let i = 0; i < Math.min(cats.length, 10); i++) {
    skillsPanel += `  ${c(`[${String(i+1).padStart(2)}]`, T.primary)} ${cats[i][1].name.padEnd(28)} ${c(`(${cats[i][1].count})`, T.muted)}\n`;
  }
  if (cats.length > 10) skillsPanel += `  ${c(`... +${cats.length - 10} more`, T.muted)}\n`;
  
  console.log(panel('📂 Skill Categories', skillsPanel, { border: T.primary }));
  console.log('');
  
  // Quick stats gauge row
  if (catalog) {
    console.log(`  ${gauge(catalog.total_skills, 2000, 'Skills', 12)}`);
    console.log(`  ${gauge(mcp.total || 0, 10000, 'MCP Servers', 12)}`);
    console.log(`  ${gauge(cats.length, 60, 'Categories', 12)}`);
  }
  console.log('');
  
  // Navigation
  const nav = [
    `${c('[1-10]', T.primary)} Category  ${c('[S]', T.primary)} Search Skills`,
    `${c('[M]', T.secondary)} MCP Servers  ${c('[A]', T.secondary)} Install All MCP`,
    `${c('[T]', T.accent)} Theme       ${c('[I]', T.muted)} Info`,
    `${c('[Q]', T.danger)} Quit`,
  ];
  console.log(box(nav.join('\n'), { border: T.muted }));
  console.log('');
  
  return { cats, mcpCats };
}

function showMCPServers(mcp) {
  clear();
  console.log(BANNER_MCP);
  console.log(`  ${c(`${mcp.total || 0} MCP Servers — ${Object.keys(mcp.categories || {}).length} Categories`, T.accent, C.bold)}`);
  console.log('');
  
  const mcpCats = Object.entries(mcp.categories || {});
  
  if (mcpCats.length === 0) {
    console.log(box(
      c('🔌 MCP Server data loading...', T.warning) + '\n' +
      c('Scraping mcpservers.org for 9,185 servers...', T.muted)
    ));
    return mcpCats;
  }
  
  // MCP categories as table
  const headers = ['#', 'Category', 'Servers', 'Action'];
  const rows = mcpCats.slice(0, 15).map(([key, cat], i) => [
    String(i + 1),
    cat.name || key,
    String(cat.count),
    c('[Install All]', T.accent),
  ]);
  
  console.log(table(headers, rows));
  console.log('');
  
  const nav = [
    `${c('[1-15]', T.primary)} Browse    ${c('[A]', T.accent)} Install All MCP`,
    `${c('[I <name>]', T.primary)} Install one  ${c('[B]', T.muted)} Back`,
    `${c('[Q]', T.danger)} Quit`,
  ];
  console.log(box(nav.join('\n'), { border: T.secondary }));
  return mcpCats;
}

function showThemePicker() {
  clear();
  console.log(BANNER_SKILLS);
  console.log(`  ${c('🎨 Theme Picker — 7 Terminal Color Schemes', T.accent, C.bold)}`);
  console.log('');
  
  const themeNames = Object.keys(THEMES);
  const headers = ['#', 'Theme', 'Preview', 'Status'];
  const rows = themeNames.map((name, i) => {
    const t = THEMES[name];
    const preview = t.primary + '███' + t.secondary + '███' + t.accent + '███' + t.success + '███' + t.danger + '███' + C.reset;
    const active = T === t ? c(' ✓ ACTIVE', T.success, C.bold) : '';
    return [String(i + 1), name.charAt(0).toUpperCase() + name.slice(1), preview, active];
  });
  
  console.log(table(headers, rows));
  console.log('');
  console.log(box(
    `${c('[1-7]', T.primary)} Select theme  ${c('[B]', T.muted)} Back  ${c('[Q]', T.danger)} Quit`
  ));
}

function showInfo(catalog, mcp) {
  clear();
  console.log(BANNER_SKILLS);
  console.log('');
  
  const info = [
    `${c('Skills Gallery', T.primary, C.bold)} ${c('v' + VERSION, T.muted)}`,
    '',
    `${c('📊 Stats', T.accent, C.bold)}`,
    `  Skills:       ${c(String(catalog ? catalog.total_skills : 0), T.success)}`,
    `  Categories:   ${c(String(catalog ? Object.keys(catalog.categories).length : 0), T.primary)}`,
    `  MCP Servers:  ${c(String(mcp.total || 'fetching...'), T.secondary)}`,
    `  Themes:       ${c('7', T.accent)} (Dark, Dracula, Tokyo, Nord, Catppuccin, Gruvbox, Solarized)`,
    '',
    `${c('🔧 Tech', T.accent, C.bold)}`,
    `  TUI Widgets:  ${c('panel, table, gauge, progress, sparkline, tabs, box', T.muted)}`,
    `  Inspired by:  ${c('tui.builders — SuperLightTUI', T.primary)}`,
    `  Zero deps:    ${c('Pure Node.js + ANSI', T.success)}`,
    '',
    `${c('🌐 Links', T.accent, C.bold)}`,
    `  GitHub:       ${c('github.com/uthumany/Skills-Gallery', T.primary)}`,
    `  npm:          ${c('npm i -g skills-gallery', T.muted)}`,
    `  Author:       ${c('uthuman Inc', T.accent)}`,
    `  MCP Source:   ${c('mcpservers.org', T.secondary)}`,
  ].join('\n');
  
  console.log(panel('ℹ️  About Skills Gallery', info, { border: T.primary }));
  console.log('');
}

// ─── Search ─────────────────────────────────────────────────────────────────
function searchAll(catalog, mcp, query) {
  const results = { skills: [], mcp: [] };
  const q = query.toLowerCase();
  
  // Search skills
  if (catalog) {
    for (const [catKey, cat] of Object.entries(catalog.categories)) {
      for (const skill of (cat.skills || [])) {
        if (skill.name.toLowerCase().includes(q) || (skill.description || '').toLowerCase().includes(q)) {
          results.skills.push({ category: cat.name, ...skill });
        }
      }
    }
  }
  
  // Search MCP servers
  if (mcp.all_servers) {
    for (const srv of mcp.all_servers) {
      if ((srv.name || '').toLowerCase().includes(q) || (srv.description || '').toLowerCase().includes(q)) {
        results.mcp.push(srv);
      }
    }
  }
  
  return results;
}

// ─── Interactive Loop ──────────────────────────────────────────────────────
async function ask(rl, question, defaultVal) {
  const prompt = defaultVal !== undefined
    ? `${question} [${c(defaultVal, T.accent)}]: `
    : `${question}: `;
  return new Promise(resolve => {
    rl.question(prompt, answer => resolve(answer.trim() || (defaultVal || '')));
  });
}

async function interactive() {
  const catalog = loadCatalog();
  const mcp = loadMCP();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  let view = 'main';
  let catKey = null;
  let searchQ = null;

  hideCursor();
  
  while (true) {
    try {
      if (view === 'main') {
        showMainMenu(catalog, mcp);
        const cmd = (await ask(rl, '\n  ›')).toUpperCase();
        
        if (cmd === 'Q' || cmd === 'QUIT') break;
        if (cmd === 'I' || cmd === 'INFO') { showInfo(catalog, mcp); await ask(rl, '\n  Press Enter'); continue; }
        if (cmd === 'M') { view = 'mcp'; continue; }
        if (cmd === 'T') { view = 'themes'; continue; }
        if (cmd === 'S') { searchQ = await ask(rl, '\n  Search'); view = 'search'; continue; }
        if (cmd === 'A') {
          const all = mcp.all_servers || [];
          if (all.length > 0) {
            const confirm = await ask(rl, `\n  Install all ${all.length} MCP servers? [y/N]`);
            if (confirm.toLowerCase() === 'y') installMCPServers(all);
          }
          await ask(rl, '\n  Press Enter');
          continue;
        }
        
        const cats = Object.entries(catalog ? catalog.categories : {});
        const num = parseInt(cmd);
        if (num >= 1 && num <= cats.length) {
          catKey = cats[num - 1][0];
          view = 'category';
          continue;
        }
      }
      
      if (view === 'category' && catKey && catalog) {
        const cat = catalog.categories[catKey];
        clear();
        console.log(BANNER_SKILLS);
        console.log('');
        console.log(panel(cat.name, 
          `${c(cat.description || '', T.muted)}\n` +
          `${c(`${cat.count} skills`, T.accent)}`,
          { border: T.primary }
        ));
        console.log('');
        
        const skills = cat.skills || [];
        for (let i = 0; i < Math.min(skills.length, 15); i++) {
          const s = skills[i];
          console.log(`  ${c(`[${String(i+1).padStart(3)}]`, T.accent)} ${c(s.name, T.fg, C.bold)}`);
          if (s.description) {
            const desc = s.description.length > 90 ? s.description.slice(0, 90) + '...' : s.description;
            console.log(`       ${c(desc, T.muted)}`);
          }
        }
        console.log('');
        console.log(box(`${c('[B]', T.muted)} Back  ${c('[Q]', T.danger)} Quit`));
        
        const cmd = (await ask(rl, '\n  ›')).toUpperCase();
        if (cmd === 'B') { view = 'main'; continue; }
        if (cmd === 'Q') break;
      }
      
      if (view === 'mcp') {
        showMCPServers(mcp);
        const cmd = (await ask(rl, '\n  ›')).toUpperCase();
        if (cmd === 'B') { view = 'main'; continue; }
        if (cmd === 'Q') break;
        if (cmd === 'A') {
          const all = mcp.all_servers || [];
          if (all.length > 0) {
            const confirm = await ask(rl, `\n  Install all ${all.length} MCP servers? [y/N]`);
            if (confirm.toLowerCase() === 'y') installMCPServers(all);
          }
          await ask(rl, '\n  Press Enter');
          continue;
        }
      }
      
      if (view === 'themes') {
        showThemePicker();
        const cmd = (await ask(rl, '\n  ›')).toUpperCase();
        if (cmd === 'B') { view = 'main'; continue; }
        if (cmd === 'Q') break;
        const themeNames = Object.keys(THEMES);
        const num = parseInt(cmd);
        if (num >= 1 && num <= themeNames.length) {
          setTheme(themeNames[num - 1]);
        }
      }
      
      if (view === 'search') {
        const results = searchAll(catalog, mcp, searchQ || '');
        clear();
        console.log(BANNER_SKILLS);
        console.log('');
        console.log(panel(`🔍 "${searchQ}"`, 
          `${c(`Skills: ${results.skills.length}`, T.primary)}  ${c(`MCP: ${results.mcp.length}`, T.secondary)}`
        ));
        console.log('');
        
        for (let i = 0; i < Math.min(results.skills.length, 8); i++) {
          const s = results.skills[i];
          console.log(`  ${c('◆', T.primary)} ${c(s.name, T.fg, C.bold)} ${c(`[${s.category}]`, T.muted)}`);
        }
        if (results.mcp.length > 0) {
          console.log(`\n  ${c('─ MCP Servers ─', T.secondary)}`);
          for (let i = 0; i < Math.min(results.mcp.length, 5); i++) {
            const s = results.mcp[i];
            console.log(`  ${c('◈', T.secondary)} ${c(s.name, T.fg, C.bold)}`);
          }
        }
        console.log('');
        console.log(box(`${c('[N]', T.primary)} New search  ${c('[B]', T.muted)} Back  ${c('[Q]', T.danger)} Quit`));
        
        const cmd = (await ask(rl, '\n  ›')).toUpperCase();
        if (cmd === 'B') { view = 'main'; continue; }
        if (cmd === 'Q') break;
        if (cmd === 'N') { searchQ = await ask(rl, '\n  Search'); continue; }
      }
      
    } catch (e) {
      console.error(c(`Error: ${e.message}`, T.danger));
      await ask(rl, '\n  Press Enter');
    }
  }
  
  showCursor();
  rl.close();
  clear();
  console.log(BANNER_SKILLS);
  console.log(c('\n  Thanks for using Skills Gallery!', T.success, C.bold));
  console.log(c('  github.com/uthumany/Skills-Gallery\n', T.muted));
}

// ─── CLI Flag Mode ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = args[0] || '';

if (flag === '--help' || flag === '-h') {
  console.log(`Skills Gallery v${VERSION} — by uthuman Inc`);
  console.log('');
  console.log('Usage:');
  console.log('  skills-gallery                        Interactive TUI browser');
  console.log('  skg                                   Short alias');
  console.log('  skills-gallery --list                 Full catalog as JSON');
  console.log('  skills-gallery --search <q>           Search skills + MCP');
  console.log('  skills-gallery --stats                Show stats');
  console.log('  skills-gallery --theme <name>         Set theme (dark|dracula|tokyo|nord|catppuccin|gruvbox|solarized)');
  console.log('  skills-gallery --mcp                  List MCP servers');
  console.log('  skills-gallery --mcp-install <name>   Install an MCP server');
  console.log('  skills-gallery --mcp-install-all      Install all MCP servers');
  process.exit(0);
}

if (flag === '--version' || flag === '-v') {
  console.log(VERSION);
  process.exit(0);
}

const catalog = loadCatalog();
const mcp = loadMCP();

if (flag === '--list') {
  console.log(JSON.stringify(catalog, null, 2));
  process.exit(0);
}

if (flag === '--stats') {
  console.log(`Skills Gallery v${VERSION} — by uthuman Inc`);
  console.log('');
  console.log(`Skills:     ${catalog ? catalog.total_skills : 0}`);
  console.log(`Categories: ${catalog ? Object.keys(catalog.categories).length : 0}`);
  console.log(`MCP:        ${mcp.total || 'fetching...'}`);
  console.log(`Themes:     7`);
  console.log(`TUI:        panel, table, gauge, progress, sparkline, tabs`);
  process.exit(0);
}

if (flag === '--mcp') {
  const mcpCats = Object.entries(mcp.categories || {});
  console.log(`MCP Servers: ${mcp.total || 0} in ${mcpCats.length} categories\n`);
  for (const [key, cat] of mcpCats) {
    console.log(`  ${cat.name || key}: ${cat.count} servers`);
  }
  process.exit(0);
}

if (flag === '--mcp-install-all') {
  const all = mcp.all_servers || [];
  if (all.length === 0) {
    console.log('No MCP data loaded. Run skills-gallery interactively first.');
    process.exit(1);
  }
  installMCPServers(all);
  process.exit(0);
}

if (flag === '--mcp-install' && args[1]) {
  const name = args[1];
  const matches = (mcp.all_servers || []).filter(s => 
    (s.name || '').toLowerCase().includes(name.toLowerCase())
  );
  if (matches.length === 0) {
    console.log(`No MCP server matching "${name}"`);
    process.exit(1);
  }
  installMCPServers(matches.slice(0, 5));
  process.exit(0);
}

if (flag === '--theme' && args[1]) {
  if (setTheme(args[1])) {
    console.log(`Theme set to: ${args[1]}`);
  } else {
    console.log(`Unknown theme: ${args[1]}. Available: ${Object.keys(THEMES).join(', ')}`);
    process.exit(1);
  }
  process.exit(0);
}

if (flag === '--search' && args[1]) {
  const results = searchAll(catalog, mcp, args[1]);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

if (flag === '--category' && args[1]) {
  const q = args[1].toLowerCase();
  let match = null;
  if (catalog) {
    for (const [key, cat] of Object.entries(catalog.categories)) {
      if (key.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
        match = { key, ...cat };
        break;
      }
    }
  }
  if (match) {
    console.log(JSON.stringify(match, null, 2));
  } else {
    console.error(`Category "${args[1]}" not found.`);
  }
  process.exit(0);
}

// No flags → interactive
interactive().catch(err => {
  showCursor();
  console.error(c(`Error: ${err.message}`, T.danger));
  process.exit(1);
});
