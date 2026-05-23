#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || join(homedir(), '.hermes', 'google_token.json');
const GSC_SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:mooma.online';
const SITEMAP_URL = process.env.SITEMAP_URL || 'https://mooma.online/sitemap.xml';
const INSPECT_LIMIT = Number.parseInt(process.env.INSPECT_LIMIT || '25', 10);
const API_ROOT = 'https://www.googleapis.com/webmasters/v3';
const URL_INSPECTION_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

function ensureTokenShape(token) {
  if (!token || typeof token !== 'object') {
    throw new Error(`Token file is not valid JSON: ${TOKEN_PATH}`);
  }
  if (!token.access_token && !token.refresh_token) {
    throw new Error(`Token file must contain access_token or refresh_token: ${TOKEN_PATH}`);
  }
}

function tokenNeedsRefresh(token) {
  if (!token.refresh_token || !token.client_id || !token.client_secret) return false;
  if (!token.access_token) return true;
  if (!token.expiry_date) return false;
  return Number(token.expiry_date) - Date.now() < 5 * 60 * 1000;
}

async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const text = await res.text();
  const json = parseJson(text);
  if (!res.ok) {
    throw new Error(`${url} failed with ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function loadToken() {
  if (!existsSync(TOKEN_PATH)) {
    throw new Error(`Google token file not found: ${TOKEN_PATH}`);
  }

  const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
  ensureTokenShape(token);

  if (!tokenNeedsRefresh(token)) return token;

  const refreshed = await postForm('https://oauth2.googleapis.com/token', {
    client_id: token.client_id,
    client_secret: token.client_secret,
    refresh_token: token.refresh_token,
    grant_type: 'refresh_token',
  });

  const nextToken = {
    ...token,
    ...refreshed,
    expiry_date: refreshed.expires_in ? Date.now() + refreshed.expires_in * 1000 : token.expiry_date,
  };
  mkdirSync(dirname(TOKEN_PATH), { recursive: true });
  writeFileSync(TOKEN_PATH, `${JSON.stringify(nextToken, null, 2)}\n`);
  return nextToken;
}

function parseJson(text) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function request(url, accessToken, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = parseJson(text);
  if (!res.ok) {
    throw new Error(`${url} failed with ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      accept: 'application/xml,text/xml,text/plain,*/*',
      'user-agent': 'mooma-gsc-index-system/1.0',
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${url} failed with ${res.status}: ${text.slice(0, 500)}`);
  }
  return text;
}

function sitePath(path = '') {
  return `${API_ROOT}/sites/${encodeURIComponent(GSC_SITE_URL)}${path}`;
}

function sitemapPath() {
  return `/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

function isSitemapIndex(xml) {
  return /<sitemapindex[\s>]/i.test(xml);
}

async function collectInspectionUrls(sitemapUrl, limit) {
  const rootXml = await fetchText(sitemapUrl);
  const childSitemaps = isSitemapIndex(rootXml) ? extractLocs(rootXml) : [sitemapUrl];
  const urls = [];
  const seen = new Set();

  for (const child of childSitemaps) {
    if (urls.length >= limit) break;
    const childXml = child === sitemapUrl && !isSitemapIndex(rootXml) ? rootXml : await fetchText(child);
    for (const loc of extractLocs(childXml)) {
      if (seen.has(loc)) continue;
      seen.add(loc);
      urls.push(loc);
      if (urls.length >= limit) break;
    }
  }

  return { childSitemaps, urls };
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

function printRows(headers, rows) {
  console.log(headers.join('\t'));
  for (const row of rows) {
    console.log(row.map((cell) => String(cell ?? '').replaceAll('\t', ' ')).join('\t'));
  }
}

async function listSites(accessToken) {
  const data = await request(`${API_ROOT}/sites`, accessToken);
  const entries = data.siteEntry || [];
  if (entries.length === 0) {
    console.log('No Search Console sites found for this token.');
    return;
  }
  printRows(
    ['siteUrl', 'permissionLevel'],
    entries.map((entry) => [entry.siteUrl, entry.permissionLevel]),
  );
}

async function submitSitemap(accessToken) {
  await request(sitePath(sitemapPath()), accessToken, { method: 'PUT' });
  printJson({
    submitted: true,
    siteUrl: GSC_SITE_URL,
    sitemapUrl: SITEMAP_URL,
  });
}

async function sitemapStatus(accessToken) {
  const data = await request(sitePath(sitemapPath()), accessToken);
  printJson(data);
}

async function inspectUrls(accessToken) {
  const limit = Number.isFinite(INSPECT_LIMIT) && INSPECT_LIMIT > 0 ? INSPECT_LIMIT : 25;
  const { childSitemaps, urls } = await collectInspectionUrls(SITEMAP_URL, limit);
  const rows = [];

  for (const url of urls) {
    const data = await request(URL_INSPECTION_ENDPOINT, accessToken, {
      method: 'POST',
      body: {
        inspectionUrl: url,
        siteUrl: GSC_SITE_URL,
      },
    });
    const index = data.inspectionResult?.indexStatusResult || {};
    rows.push([
      url,
      index.verdict || '',
      index.coverageState || '',
      index.indexingState || '',
      index.pageFetchState || '',
      index.lastCrawlTime || '',
    ]);
  }

  console.log(`# sitemap children: ${childSitemaps.length}`);
  console.log(`# inspected urls: ${rows.length}`);
  printRows(['url', 'verdict', 'coverageState', 'indexingState', 'pageFetchState', 'lastCrawlTime'], rows);
}

function usage() {
  console.log(`Usage: node scripts/gsc-index-system.mjs <command>

Commands:
  list-sites       List Search Console sites available to the token
  submit-sitemap   Submit SITEMAP_URL to GSC, default ${SITEMAP_URL}
  sitemap-status   Print GSC sitemap status for SITEMAP_URL
  inspect-urls     Parse sitemap XML and inspect up to INSPECT_LIMIT URLs

ENV:
  GSC_SITE_URL      Default ${GSC_SITE_URL}
  SITEMAP_URL       Default ${SITEMAP_URL}
  INSPECT_LIMIT     Default ${Number.isFinite(INSPECT_LIMIT) ? INSPECT_LIMIT : 25}
  GOOGLE_TOKEN_PATH Default ${TOKEN_PATH}`);
}

async function main() {
  const command = process.argv[2];
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    return;
  }

  const token = await loadToken();
  const commands = {
    'list-sites': listSites,
    'submit-sitemap': submitSitemap,
    'sitemap-status': sitemapStatus,
    'inspect-urls': inspectUrls,
  };
  const action = commands[command];

  if (!action) {
    usage();
    throw new Error(`Unknown command: ${command}`);
  }

  await action(token.access_token);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
