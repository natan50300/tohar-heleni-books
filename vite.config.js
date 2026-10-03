import { defineConfig } from 'vite';

// GitHub Pages serves the site under /<repo-name>/
export default defineConfig({
  base: '/tohar-heleni-books/',
  build: { target: 'es2020' },
});
