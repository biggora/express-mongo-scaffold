import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '..', 'src', 'templates');
const dest = join(__dirname, '..', 'dist', 'templates');

if (!existsSync(dest)) {
  mkdirSync(dest, { recursive: true });
}

cpSync(src, dest, { recursive: true });
console.log('Templates copied to dist/templates/');
