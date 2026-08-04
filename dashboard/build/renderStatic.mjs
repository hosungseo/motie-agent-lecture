import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHtml } from './lib/renderHtml.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(path.join(root, 'data/data.json'), 'utf8'));

writeFileSync(path.join(root, 'index.html'), renderHtml(data));
console.log(`rendered dashboard/index.html from ${data.regions.length} regions`);
