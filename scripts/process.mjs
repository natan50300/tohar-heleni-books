// Turns the raw illustrations in raw/<id>/ into the WebP files the site uses.
// Raw files must be named cover.png, p01.png, p02.png ... (png/jpg/webp).
// Usage: npm run process -- --book <id>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { BOOKS_DIR, arg, readBook, pageNames } from './lib.mjs';

const id = arg('book');
if (!id) throw new Error('missing --book <id>');
const book = readBook(id);
// Wide books (book.ratio, e.g. 2) keep their raw files in raw/<id>-wide/.
const ratio = Number(book.ratio) || 1.5;
const dir = book.ratio ? `raw/${id}-wide` : `raw/${id}`;
const find = (name) => ['png', 'jpg', 'jpeg', 'webp'].map((e) => `${dir}/${name}.${e}`).find(existsSync);

const missing = [];
for (const name of pageNames(book)) {
  const src = find(name);
  if (!src) {
    missing.push(name);
    continue;
  }
  // The large file is named -1600 but keeps up to 1800px of the source, so wide pictures stay sharp on phones.
  for (const [label, w] of [[1600, book.ratio ? 1800 : 1600], [800, 800]]) {
    const h = Math.round(w / ratio);
    await sharp(src).resize(w, h, { fit: 'cover', withoutEnlargement: true }).webp({ quality: 88 }).toFile(`${BOOKS_DIR}/${id}/${name}-${label}.webp`);
  }
}

const file = `${BOOKS_DIR}/${id}/book.json`;
const json = JSON.parse(readFileSync(file, 'utf8'));
json.hasArt = missing.length === 0;
writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
console.log(missing.length ? `missing pages: ${missing.join(', ')}` : `${id}: all ${pageNames(book).length} pages ready`);
execFileSync(process.execPath, ['scripts/build-index.mjs'], { stdio: 'inherit' });
