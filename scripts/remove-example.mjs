#!/usr/bin/env node
/**
 * Remove the bundled Toolshop worked example once you no longer need it.
 *
 *   npm run example:remove
 *
 * Deletes examples/toolshop and its knowledge pages, and removes the example
 * suite from playwright.config.ts. Your own app (features/, src/app/,
 * knowledge/) is not touched.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

rmSync('examples/toolshop', { recursive: true, force: true });
rmSync('.features-gen/toolshop', { recursive: true, force: true });

const configPath = 'playwright.config.ts';
let config = readFileSync(configPath, 'utf8');
config = config
  .replace(/^import \{ toolshopSuite \} from '\.\/examples\/toolshop\/suite';\n/m, '')
  .replace(/, \.\.\.\(env\.INCLUDE_EXAMPLES \? \[toolshopSuite\] : \[\]\)/, '');
writeFileSync(configPath, config);

for (const file of ['.env', '.env.example']) {
  if (existsSync(file)) {
    writeFileSync(file, readFileSync(file, 'utf8').replace(/^INCLUDE_EXAMPLES=.*$/m, 'INCLUDE_EXAMPLES=false'));
  }
}
console.log('Removed the Toolshop example. Run: npm test');
