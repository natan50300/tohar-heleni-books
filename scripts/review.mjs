// Writes review.html (local only): every page of every book in a grid, with its text.
// Usage: npm run review [-- --book <id>]
import { writeFileSync, existsSync } from 'node:fs';
import { BOOKS_DIR, arg, bookIds, readBook, pageNames } from './lib.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const ids = arg('book') ? [arg('book')] : bookIds();

const sections = ids.map((id) => {
  const book = readBook(id);
  const texts = [book.title, ...book.pages.map((p) => p.text)];
  const cells = pageNames(book).map((name, i) => {
    const src = `${BOOKS_DIR}/${id}/${name}-800.webp`;
    const pic = existsSync(src) ? `<img loading="lazy" src="${src}">` : `<div class="none">אין תמונה</div>`;
    return `<figure><b>${i === 0 ? 'כריכה' : i}</b>${pic}<figcaption>${esc(texts[i]).replace(/\n/g, '<br>')}</figcaption></figure>`;
  });
  return `<h2>${esc(book.title)} <small>(${id})</small></h2><div class="grid">${cells.join('')}</div>`;
});

writeFileSync(
  'review.html',
  `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><title>סקירת איורים</title>
<style>
body{background:#1b1f33;color:#eee3cf;font-family:system-ui;margin:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
figure{margin:0;background:#262b45;border-radius:8px;padding:8px;position:relative}
img,.none{width:100%;aspect-ratio:3/2;border-radius:4px;display:grid;place-items:center;background:#33395a}
b{position:absolute;top:12px;right:12px;background:#000a;padding:2px 8px;border-radius:9px}
figcaption{padding-top:6px;line-height:1.5} small{color:#9a96a8;font-weight:400}
</style>${sections.join('')}</html>`,
);
console.log('review.html written');
