// Renders the PNG app icons from public/icon.svg.
import sharp from 'sharp';

for (const size of [180, 192, 512]) {
  await sharp('public/icon.svg', { density: 300 }).resize(size, size).png().toFile(`public/icon-${size}.png`);
}
console.log('icons written');
