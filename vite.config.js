import { defineConfig } from 'vite';

// Every build gets a stamp. The open app compares it with version.json and reloads itself when a newer one is published.
const build = String(Date.now());

// GitHub Pages serves the site under /<repo-name>/
export default defineConfig({
  base: '/tohar-heleni-books/',
  build: { target: 'es2020' },
  define: { __BUILD__: JSON.stringify(build) },
  plugins: [
    {
      name: 'version-file',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build }) });
      },
    },
  ],
});
