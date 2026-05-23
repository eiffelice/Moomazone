#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const TOKEN_PATH = process.env.GOOGLE_TOKEN_PATH || join(homedir(), '.hermes', 'google_token.json');
const GSC_SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:mooma.online';
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const REPORT_DIR = join(process.cwd(), 'reports', 'seo');
const TRACKED_EVENTS = [
  'affiliate_cta_click',
  'product_click',
  'category_click',
  'compare_article_click',
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function number(value, digits = 0) {
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function pct(value, digits = 1) {
  return `${number(value * 100, digits)}%`;
}

function signed(value, digits = 0) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${number(value, digits)}`;
}

function ratioChange(current, previous) {
  if (!previous && !current) return 0;
  if (!previous) return 1;
  return (current - previous) / previous;
}

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
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${url} failed with ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function requestJson(url, accessToken, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
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

async function querySearchConsole(accessToken, dateRange, dimensions) {
  const site = encodeURIComponent(GSC_SITE_URL);
  return requestJson(
    `https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
    accessToken,
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dimensions,
      rowLimit: 25000,
      dataState: 'final',
    },
  );
}

function totalRows(rows = []) {
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const weightedPosition = rows.reduce(
    (sum, row) => sum + (row.position || 0) * (row.impressions || 0),
    0,
  );
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? weightedPosition / impressions : 0,
  };
}

function indexByKey(rows = []) {
  return new Map(rows.map((row) => [row.keys?.join(' | ') || '(not set)', row]));
}

function compareRows(currentRows = [], previousRows = [], limit = 10) {
  const previousByKey = indexByKey(previousRows);
  return currentRows
    .map((row) => {
      const key = row.keys?.join(' | ') || '(not set)';
      const previous = previousByKey.get(key) || {};
      return {
        key,
        clicks: row.clicks || 0,
        clicksDelta: (row.clicks || 0) - (previous.clicks || 0),
        impressions: row.impressions || 0,
        impressionsDelta: (row.impressions || 0) - (previous.impressions || 0),
        ctr: row.ctr || 0,
        ctrDelta: (row.ctr || 0) - (previous.ctr || 0),
        position: row.position || 0,
        positionDelta: (row.position || 0) - (previous.position || 0),
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

async function runGa4Report(accessToken, dateRange) {
  if (!GA4_PROPERTY_ID) return null;

  return requestJson(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    accessToken,
    {
      dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
      dimensions: [{ name: 'eventName' }, { name: 'pagePath' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { values: TRACKED_EVENTS },
        },
      },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: '100',
    },
  );
}

function parseGa4Rows(report) {
  const rows = report?.rows || [];
  return rows.map((row) => ({
    eventName: row.dimensionValues?.[0]?.value || '(not set)',
    pagePath: row.dimensionValues?.[1]?.value || '(not set)',
    count: Number(row.metricValues?.[0]?.value || 0),
  }));
}

function eventTotals(rows) {
  const totals = new Map(TRACKED_EVENTS.map((name) => [name, 0]));
  for (const row of rows) totals.set(row.eventName, (totals.get(row.eventName) || 0) + row.count);
  return [...totals.entries()].map(([eventName, count]) => ({ eventName, count }));
}

function compareEventTotals(currentRows, previousRows) {
  const previous = new Map(eventTotals(previousRows).map((row) => [row.eventName, row.count]));
  return eventTotals(currentRows).map((row) => ({
    ...row,
    previous: previous.get(row.eventName) || 0,
  }));
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function renderSearchRows(rows) {
  if (rows.length === 0) return '_ไม่มีข้อมูล_';
  return markdownTable(
    ['รายการ', 'คลิก', 'คลิกเปลี่ยน', 'แสดงผล', 'แสดงผลเปลี่ยน', 'CTR', 'อันดับเฉลี่ย'],
    rows.map((row) => [
      row.key.replaceAll('|', '\\|'),
      number(row.clicks),
      signed(row.clicksDelta),
      number(row.impressions),
      signed(row.impressionsDelta),
      `${pct(row.ctr)} (${signed(row.ctrDelta * 100, 1)} จุด)`,
      `${number(row.position, 1)} (${signed(row.positionDelta, 1)})`,
    ]),
  );
}

function renderEventRows(rows) {
  if (rows.length === 0) return '_ไม่มีข้อมูล_';
  return markdownTable(
    ['event', 'page_path', 'count'],
    rows.slice(0, 20).map((row) => [
      row.eventName,
      row.pagePath.replaceAll('|', '\\|'),
      number(row.count),
    ]),
  );
}

function renderReport({ ranges, gsc, ga4 }) {
  const currentTotal = totalRows(gsc.current.pages.rows);
  const previousTotal = totalRows(gsc.previous.pages.rows);
  const pageRows = compareRows(gsc.current.pages.rows, gsc.previous.pages.rows);
  const queryRows = compareRows(gsc.current.queries.rows, gsc.previous.queries.rows);
  const lowCtrRows = (gsc.current.pages.rows || [])
    .filter((row) => (row.impressions || 0) >= 20)
    .sort((a, b) => (a.ctr || 0) - (b.ctr || 0) || (b.impressions || 0) - (a.impressions || 0))
    .slice(0, 10)
    .map((row) => [
      (row.keys?.[0] || '(not set)').replaceAll('|', '\\|'),
      number(row.impressions),
      number(row.clicks),
      pct(row.ctr || 0),
      number(row.position || 0, 1),
    ]);

  const ga4CurrentRows = ga4?.currentRows || [];
  const ga4PreviousRows = ga4?.previousRows || [];
  const ga4Totals = compareEventTotals(ga4CurrentRows, ga4PreviousRows);

  return `# Weekly SEO Dashboard: ${ranges.reportDate}

ช่วงล่าสุด: ${ranges.current.startDate} ถึง ${ranges.current.endDate}  
ช่วงเทียบก่อนหน้า: ${ranges.previous.startDate} ถึง ${ranges.previous.endDate}  
Search Console property: \`${GSC_SITE_URL}\`

## ภาพรวม Search Console

${markdownTable(
  ['metric', 'ล่าสุด', 'ก่อนหน้า', 'เปลี่ยน'],
  [
    [
      'clicks',
      number(currentTotal.clicks),
      number(previousTotal.clicks),
      `${signed(currentTotal.clicks - previousTotal.clicks)} (${pct(ratioChange(currentTotal.clicks, previousTotal.clicks))})`,
    ],
    [
      'impressions',
      number(currentTotal.impressions),
      number(previousTotal.impressions),
      `${signed(currentTotal.impressions - previousTotal.impressions)} (${pct(ratioChange(currentTotal.impressions, previousTotal.impressions))})`,
    ],
    ['CTR', pct(currentTotal.ctr), pct(previousTotal.ctr), `${signed((currentTotal.ctr - previousTotal.ctr) * 100, 1)} จุด`],
    ['avg position', number(currentTotal.position, 1), number(previousTotal.position, 1), signed(currentTotal.position - previousTotal.position, 1)],
  ],
)}

## หน้าเด่น

${renderSearchRows(pageRows)}

## คำค้นเด่น

${renderSearchRows(queryRows)}

## หน้า impression สูง แต่ CTR ต่ำ

${lowCtrRows.length ? markdownTable(['page', 'impressions', 'clicks', 'CTR', 'avg position'], lowCtrRows) : '_ไม่มีข้อมูล_'}

## Click Tracking จาก GA4

${GA4_PROPERTY_ID ? `GA4 property: \`${GA4_PROPERTY_ID}\`` : '_ข้ามส่วนนี้เพราะไม่ได้ตั้งค่า `GA4_PROPERTY_ID`_'}

${GA4_PROPERTY_ID ? markdownTable(['event', 'ล่าสุด', 'ก่อนหน้า', 'เปลี่ยน'], ga4Totals.map((row) => [row.eventName, number(row.count), number(row.previous), signed(row.count - row.previous)])) : ''}

${GA4_PROPERTY_ID ? renderEventRows(ga4CurrentRows) : ''}

## งานรอบถัดไป

- ตรวจหน้า CTR ต่ำและปรับ title/meta ให้ตรง intent
- เพิ่ม internal link จากหน้าที่มี impressions ไปยังหน้าหลักของ cluster
- ตรวจ CTA และ event params ของหน้าที่มี clicks แต่ event ต่ำ
`;
}

async function main() {
  const today = new Date();
  const end = shiftDate(today, -1);
  const start = shiftDate(end, -6);
  const previousEnd = shiftDate(start, -1);
  const previousStart = shiftDate(previousEnd, -6);
  const ranges = {
    reportDate: isoDate(today),
    current: { startDate: isoDate(start), endDate: isoDate(end) },
    previous: { startDate: isoDate(previousStart), endDate: isoDate(previousEnd) },
  };

  const token = await loadToken();
  const currentPages = await querySearchConsole(token.access_token, ranges.current, ['page']);
  const previousPages = await querySearchConsole(token.access_token, ranges.previous, ['page']);
  const currentQueries = await querySearchConsole(token.access_token, ranges.current, ['query']);
  const previousQueries = await querySearchConsole(token.access_token, ranges.previous, ['query']);
  const ga4CurrentReport = await runGa4Report(token.access_token, ranges.current);
  const ga4PreviousReport = await runGa4Report(token.access_token, ranges.previous);
  const ga4CurrentRows = parseGa4Rows(ga4CurrentReport);
  const ga4PreviousRows = parseGa4Rows(ga4PreviousReport);

  const markdown = renderReport({
    ranges,
    gsc: {
      current: { pages: currentPages, queries: currentQueries },
      previous: { pages: previousPages, queries: previousQueries },
    },
    ga4: {
      currentRows: ga4CurrentRows,
      previousRows: ga4PreviousRows,
    },
  });

  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = join(REPORT_DIR, `weekly-${ranges.reportDate}.md`);
  writeFileSync(reportPath, markdown);
  console.log(reportPath);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
