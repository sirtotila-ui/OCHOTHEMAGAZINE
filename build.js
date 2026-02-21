/**
 * Scansiona la cartella photos/ e genera images.json.
 * Ogni sottocartella diventa una sezione (foto ordinate dalla più recente).
 * Esegui: node build.js
 */

const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, 'photos');
const OUT_FILE = path.join(__dirname, 'images.json');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function getImagesForSection(sectionName) {
  const dir = path.join(PHOTOS_DIR, sectionName);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];

  const files = fs.readdirSync(dir)
    .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
    .map((f) => {
      const fullPath = path.join(dir, f);
      return { name: f, mtime: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime)
    .map((o) => `photos/${sectionName}/${o.name}`);

  return files;
}

if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

const subdirs = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const out = {};
subdirs.forEach((name) => {
  out[name] = getImagesForSection(name);
});

fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
console.log('Scritto', OUT_FILE);
Object.keys(out).forEach((s) => console.log('  ', s + ':', out[s].length, 'foto'));
