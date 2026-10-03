// Builds the site and publishes dist/ to the gh-pages branch (the branch GitHub Pages serves).
// Usage: npm run deploy
import { execSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const remote = execSync('git remote get-url origin').toString().trim();
const name = execSync('git config user.name').toString().trim();
const email = execSync('git config user.email').toString().trim();

run('npm run build');
writeFileSync('dist/.nojekyll', '');
rmSync('dist/.git', { recursive: true, force: true });
run('git init -q -b gh-pages', 'dist');
run(`git config user.name "${name}"`, 'dist');
run(`git config user.email "${email}"`, 'dist');
run('git add -A', 'dist');
run('git commit -q -m "Deploy"', 'dist');
run(`git push -f "${remote}" gh-pages`, 'dist');
rmSync('dist/.git', { recursive: true, force: true });
console.log('deployed');
