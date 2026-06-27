/**
 * Skills Gallery — Programmatic API
 *
 * Import this module to access the skills catalog programmatically.
 *
 * @example
 *   const gallery = require('skills-gallery');
 *   console.log(gallery.stats.total_skills); // 1672
 *   console.log(gallery.listCategories());    // ['ai-ml', 'devops', ...]
 *   console.log(gallery.searchSkills('docker')); // [{ name: '...', ... }]
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

function getAllSkills(catalog) {
  const all = {};
  for (const [catKey, cat] of Object.entries(catalog.categories)) {
    for (const skill of (cat.skills || [])) {
      all[skill.name] = { ...skill, category: cat.name, categoryKey: catKey };
    }
  }
  return all;
}

module.exports = {
  get stats() {
    const catalog = load();
    const cats = Object.entries(catalog.categories);
    return {
      total_skills: catalog.total_skills,
      total_categories: cats.length,
      version: '2.0.0',
      author: 'uthuman Inc',
      repository: 'https://github.com/uthumany/Skills-Gallery',
    };
  },

  listCategories() {
    const catalog = load();
    return Object.entries(catalog.categories)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, cat]) => ({
        key,
        name: cat.name,
        description: cat.description,
        count: cat.count,
      }));
  },

  getCategory(key) {
    const catalog = load();
    const cat = catalog.categories[key];
    if (!cat) return null;
    return {
      key,
      name: cat.name,
      description: cat.description,
      count: cat.count,
      skills: cat.skills || [],
    };
  },

  searchSkills(query) {
    const catalog = load();
    const q = query.toLowerCase();
    const results = [];
    for (const [catKey, cat] of Object.entries(catalog.categories)) {
      for (const skill of (cat.skills || [])) {
        if (skill.name.toLowerCase().includes(q) || (skill.description || '').toLowerCase().includes(q)) {
          results.push({ ...skill, category: cat.name, categoryKey: catKey });
        }
      }
    }
    return results;
  },

  allSkills() {
    return getAllSkills(load());
  },

  getCatalog() {
    return load();
  },
};
