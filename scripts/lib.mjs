import { readFileSync, readdirSync, existsSync } from 'node:fs';

export const BOOKS_DIR = 'public/books';

export const arg = (name) => {
  const i = process.argv.indexOf('--' + name);
  return i === -1 ? null : process.argv[i + 1];
};

export const pad = (n) => String(n).padStart(2, '0');

export const readBook = (id) => JSON.parse(readFileSync(`${BOOKS_DIR}/${id}/book.json`, 'utf8'));

export const bookIds = () =>
  readdirSync(BOOKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`${BOOKS_DIR}/${d.name}/book.json`))
    .map((d) => d.name);

// Page names in file order: cover, p01, p02, ...
export const pageNames = (book) => ['cover', ...book.pages.map((_, i) => 'p' + pad(i + 1))];

// The first fenced block of a markdown file holds the text that goes into every prompt.
export const promptBlock = (file) => readFileSync(file, 'utf8').match(/```\n([\s\S]*?)```/)[1].trim();
