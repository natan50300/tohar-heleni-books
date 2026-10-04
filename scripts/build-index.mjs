// Builds public/books/index.json (the shelf) from every book.json.
import { writeFileSync } from 'node:fs';
import { BOOKS_DIR, bookIds, readBook } from './lib.mjs';

const books = bookIds()
  .map((id) => {
    const b = readBook(id);
    return { id, order: b.order ?? 999, title: b.title, subtitle: b.subtitle, for: b.for, palette: b.palette, hasArt: !!b.hasArt, rev: b.rev, sounds: !!b.coverSpots || b.pages.some((p) => p.spots) };
  })
  .filter((b) => b.hasArt || process.argv.includes('--all'))
  .sort((a, b) => a.order - b.order);

writeFileSync(`${BOOKS_DIR}/index.json`, JSON.stringify(books, null, 2) + '\n');
console.log(`index.json: ${books.length} books`);
