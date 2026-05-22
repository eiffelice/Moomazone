#!/usr/bin/env node
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const source = join(distDir, 'sitemap-index.xml');
const target = join(distDir, 'sitemap.xml');

if (!existsSync(source)) {
  console.error(`Missing ${source}. Run astro build before aliasing sitemap.`);
  process.exit(1);
}

copyFileSync(source, target);

const bytes = statSync(target).size;
console.log(`✅ Aliased /sitemap.xml → sitemap-index.xml (${bytes} bytes)`);
