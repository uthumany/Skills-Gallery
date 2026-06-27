/**
 * Hermes Skills Gallery — Programmatic API
 *
 * Import this module to access the skills catalog programmatically.
 *
 * @example
 *   const gallery = require('hermes-skills-gallery');
 *   console.log(gallery.stats.total_skills); // 18
 *   console.log(gallery.listCategories());    // ['development', 'productivity', ...]
 *   console.log(gallery.searchSkills('docker')); // [{ name: 'Docker Expert', ... }]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, 'data', 'skills-catalog.json');

let _catalog = null;

function load() {
  if (!_catalog) {
    _catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  }
  return _catalog;
}

/**
 * Get the full skills catalog.
 * @returns {Object} The complete catalog object
 */
function getCatalog() {
  return JSON.parse(JSON.stringify(load()));
}

/**
 * List all category keys.
 * @returns {string[]} Array of category keys
 */
function listCategories() {
  return Object.keys(load().categories);
}

/**
 * Get a specific category by key.
 * @param {string} key - Category key (e.g., 'development', 'productivity')
 * @returns {Object|null} The category object or null if not found
 */
function getCategory(key) {
  const cat = load().categories[key];
  return cat ? JSON.parse(JSON.stringify(cat)) : null;
}

/**
 * List all skills across all categories.
 * @returns {Object} Map of skillKey -> skill object
 */
function listAllSkills() {
  const all = {};
  for (const cat of Object.values(load().categories)) {
    Object.assign(all, cat.skills);
  }
  return JSON.parse(JSON.stringify(all));
}

/**
 * Get a specific skill by key.
 * @param {string} key - Skill key (e.g., 'code-reviewer', 'docker-expert')
 * @returns {Object|null} The skill object or null if not found
 */
function getSkill(key) {
  for (const cat of Object.values(load().categories)) {
    if (cat.skills[key]) {
      return JSON.parse(JSON.stringify(cat.skills[key]));
    }
  }
  return null;
}

/**
 * Search skills by query string.
 * Matches against name, description, tags, and author.
 * @param {string} query - Search query
 * @returns {Array<{key: string, category: string, skill: Object}>} Matching skills
 */
function searchSkills(query) {
  const q = query.toLowerCase();
  const results = [];
  for (const [catKey, cat] of Object.entries(load().categories)) {
    for (const [skillKey, skill] of Object.entries(cat.skills)) {
      if (
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some(t => t.toLowerCase().includes(q)) ||
        skill.author.toLowerCase().includes(q)
      ) {
        results.push({
          key: skillKey,
          category: catKey,
          categoryName: cat.name,
          ...JSON.parse(JSON.stringify(skill)),
        });
      }
    }
  }
  return results;
}

/**
 * Get featured skills.
 * @returns {Array<{key: string, skill: Object}>} Featured skills
 */
function getFeatured() {
  const catalog = load();
  const all = listAllSkills();
  return catalog.featured
    .filter(key => all[key])
    .map(key => ({ key, ...all[key] }));
}

/**
 * Catalog statistics.
 */
const stats = Object.freeze({
  get total_skills() { return Object.keys(listAllSkills()).length; },
  get total_categories() { return Object.keys(load().categories).length; },
  get version() { return load().version; },
  get name() { return load().name; },
  get description() { return load().description; },
  get featured_count() { return load().featured.length; },
});

module.exports = {
  getCatalog,
  listCategories,
  getCategory,
  listAllSkills,
  getSkill,
  searchSkills,
  getFeatured,
  stats,
};
