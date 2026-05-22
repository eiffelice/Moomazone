#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const site = 'https://mooma.online';
const checkExternal = process.env.CHECK_EXTERNAL === '1';
const errors = [];
const warnings = [];

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function read(path) { return readFileSync(path, 'utf8'); }
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}
function routeFromHtml(path) {
  const rel = relative(dist, path).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
}
function stripHashAndQuery(value) { return value.split('#')[0].split('?')[0]; }
function isExternal(value) { return /^https?:\/\//i.test(value); }
function isIgnored(value) {
  return !value || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:');
}
function internalExists(pathname) {
  if (pathname === '/') return existsSync(join(dist, 'index.html'));
  const clean = pathname.replace(/^\//, '').replace(/\/$/, '');
  return existsSync(join(dist, clean, 'index.html')) || existsSync(join(dist, clean)) || existsSync(join(dist, `${clean}.html`));
}
function attrValues(html, attr) {
  const re = new RegExp(`${attr}=["']([^"']+)["']`, 'gi');
  return [...html.matchAll(re)].map((m) => m[1]);
}

if (!existsSync(dist)) fail('dist/ missing — run npm run build first.');

if (existsSync(dist)) {
  const htmlFiles = walk(dist).filter((path) => path.endsWith('.html'));
  const routes = htmlFiles.map(routeFromHtml).sort();
  const sitemapPath = join(dist, 'sitemap.xml');
  const sitemapIndexPath = join(dist, 'sitemap-index.xml');
  const robotsPath = join(dist, 'robots.txt');

  if (!existsSync(sitemapPath)) fail('Missing dist/sitemap.xml alias.');
  if (!existsSync(sitemapIndexPath)) fail('Missing dist/sitemap-index.xml.');
  if (!existsSync(robotsPath)) fail('Missing dist/robots.txt.');

  if (existsSync(robotsPath)) {
    const robots = read(robotsPath);
    if (/Disallow:\s*\//i.test(robots) && !/Allow:\s*\//i.test(robots)) {
      fail('robots.txt may block the whole site with Disallow: /.');
    }
    if (!/Sitemap:\s*https:\/\/mooma\.online\/(sitemap\.xml|sitemap-index\.xml)/i.test(robots)) {
      warn('robots.txt does not explicitly point to a mooma.online sitemap.');
    }
  }

  if (existsSync(sitemapPath)) {
    let sitemap = read(sitemapPath);
    for (const loc of [...sitemap.matchAll(/<loc>https:\/\/mooma\.online\/(sitemap-[^<]+)<\/loc>/gi)].map((m) => m[1])) {
      const childPath = join(dist, loc);
      if (existsSync(childPath)) sitemap += read(childPath);
      else fail(`Sitemap index references missing child sitemap: ${loc}`);
    }
    for (const route of routes) {
      const url = `${site}${route === '/' ? '' : route}`;
      if (!sitemap.includes(url)) fail(`Sitemap missing route: ${url}`);
    }
  }

  for (const file of htmlFiles) {
    const html = read(file);
    const route = routeFromHtml(file);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (!canonical) fail(`${route}: missing canonical link.`);
    if (canonical && !canonical.startsWith(site)) fail(`${route}: canonical is outside mooma.online: ${canonical}`);

    for (const href of attrValues(html, 'href')) {
      if (isIgnored(href)) continue;
      const clean = stripHashAndQuery(href);
      if (isExternal(clean)) continue;
      if (!clean.startsWith('/')) continue;
      if (!internalExists(clean)) fail(`${route}: broken internal href ${href}`);
    }

    for (const src of attrValues(html, 'src')) {
      if (isIgnored(src) || isExternal(src) || src.startsWith('data:')) continue;
      const clean = stripHashAndQuery(src);
      if (clean.startsWith('/') && !internalExists(clean)) fail(`${route}: broken local asset src ${src}`);
    }
  }

  console.log(`Checked ${routes.length} routes from dist/.`);
}

if (checkExternal && existsSync(dist)) {
  const html = walk(dist).filter((path) => path.endsWith('.html')).map(read).join('\n');
  const links = [...new Set([...attrValues(html, 'href'), ...attrValues(html, 'src')].filter(isExternal))];
  const affiliateLinks = links.filter((url) => /(^https?:\/\/)?(s\.)?shopee\.co\.th/i.test(url));
  console.log(`External check enabled: ${affiliateLinks.length} Shopee links found.`);
  for (const url of affiliateLinks) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: controller.signal });
      clearTimeout(timer);
      if (![200, 301, 302, 303, 307, 308, 403, 405].includes(res.status)) {
        warn(`Shopee link unusual status ${res.status}: ${url}`);
      }
    } catch (err) {
      warn(`Shopee link check failed: ${url} (${err.message})`);
    }
  }
}

for (const warning of warnings) console.warn(`⚠️  ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`❌ ${error}`);
  console.error(`Site health check failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log('✅ Site health check passed.');
