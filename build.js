/**
 * Scans the photos/ folder and generates images.json (newest first per section).
 * Run: node build.js
 * Then add your images in photos/editoriale/, photos/ritratti/, etc.
 */

const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, 'photos');
const OUT_FILE = path.join(__dirname, 'images.json');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const SECTION_FOLDERS = ['editoriale', 'ritratti', 'street', 'reportage', 'still-life'];

function getImagesForSection(sectionName) {
  const dir = path.join(PHOTOS_DIR, sectionName);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir)
    .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
    .map((f) => {
      const fullPath = path.join(dir, f);
      return { name: f, mtime: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime) // newest first
    .map((o) => `photos/${sectionName}/${o.name}`);

  return files;
}

const out = {};
for (const section of SECTION_FOLDERS) {
  out[section] = getImagesForSection(section);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
console.log('Scritto', OUT_FILE);
SECTION_FOLDERS.forEach((s) => console.log('  ', s + ':', out[s].length, 'foto'));
