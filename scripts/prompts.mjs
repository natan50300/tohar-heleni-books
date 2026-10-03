// Prints the illustration prompt for every page of a book.
// Usage: npm run prompts -- --book <id> [--page <n>]   (page 0 = cover)
import { arg, readBook, pageNames, promptBlock } from './lib.mjs';

const id = arg('book');
if (!id) throw new Error('missing --book <id>');
const only = arg('page');
const book = readBook(id);
const style = promptBlock('art/style.md');
const characters = promptBlock('art/characters/README.md');
const sets = book.outfits;
const firstSet = Object.keys(sets)[0];

const outfitText = (key) =>
  Object.entries(sets[key] ?? sets[firstSet])
    .filter(([who]) => book.for === 'both' || who === book.for)
    .map(([who, text]) => `${who[0].toUpperCase() + who.slice(1)} wears ${text}`)
    .join(' ');

const scenes = [{ scene: book.coverScene, outfit: book.coverOutfit }, ...book.pages];

pageNames(book).forEach((name, i) => {
  if (only !== null && Number(only) !== i) return;
  const p = scenes[i];
  console.log(`### ${name}`);
  console.log([style, characters, `OUTFITS: ${outfitText(p.outfit)}`, `SCENE: ${p.scene}`].join('\n\n'));
  console.log();
});
