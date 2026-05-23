# HANDOFF

## สถานะล่าสุด

สร้างและ deploy บทความ SEO ชุดแมว + ชุดสุนัขสำหรับ mooma.online แล้ว รวม 6 บทความ พร้อมเพิ่มลิงก์บนหน้าแรกและหน้า `/reviews/` ขึ้น production แล้ว และ submit sitemap เข้า Google Search Console ล่าสุดแล้ว

## งานที่เสร็จแล้ว

### บทความแมว

- `/articles/cat-pee-smell-solution/`
- `/articles/cat-food-skin-coat-guide/`
- `/articles/cat-condo-new-owner-checklist/`

### บทความสุนัข

- `/articles/dog-not-eating-guide/`
- `/articles/dog-dental-chews-guide/`
- `/articles/dog-bad-breath-solution/`

### Integration

- เพิ่มการ์ดบทความใหม่ใน `src/pages/reviews.astro`
- เพิ่ม/อัปเดต section “บทความแนะนำสำหรับทาสหมาแมว” บนหน้าแรก `src/pages/index.astro`
- ใส่ SEO meta, canonical, structured data, FAQ, breadcrumb, internal links และ affiliate disclosure ในบทความทุกหน้า
- Deploy ขึ้น Cloudflare Pages production แล้ว

### Google Search Console

- GSC property: `sc-domain:mooma.online`
- Permission: `siteOwner`
- Submitted sitemap: `https://mooma.online/sitemap.xml`
- Submission result: submitted successfully
- Sitemap status after submit:
  - `isPending: true`
  - `isSitemapsIndex: true`
  - `warnings: 0`
  - `errors: 0`
  - GSC still showed old downloaded count at the moment of check because Google has not reprocessed the latest sitemap yet

## ผลตรวจล่าสุด

- URL Inspection API inspected 27 URLs from sitemap
- Homepage: `PASS` / Submitted and indexed
- `/compare/uv-vs-regular-litter-box/`: `PASS` / Submitted and indexed
- 6 new article URLs: `NEUTRAL` / URL is unknown to Google — expected for newly published URLs before crawl
- Production spot-check:
  - 6 article URLs return HTTP 200
  - each article has canonical URL
  - each article has JSON-LD
  - homepage and `/reviews/` link to the new article set

## งานที่ยังค้าง

- Google has not indexed the 6 new articles yet
- GSC sitemap is pending reprocess
- ยังไม่ได้ commit/push งานเข้า Git remote

## สิ่งที่ต้องทำต่อ

1. Wait 24–72 hours for Google to re-crawl the submitted sitemap
2. Re-run:
   - `npm run seo:gsc:sitemap-status`
   - `INSPECT_LIMIT=27 npm run seo:gsc:inspect`
3. ถ้าหลัง 2–3 วันยัง unknown ให้ใช้ URL Inspection ใน GSC browser กด Request Indexing ทีละ URL
4. หลังเริ่มมี impressions ให้ทำบทความถัดไปจาก query จริง

## คำเตือน

- GSC URL Inspection API ตรวจสถานะได้ แต่ไม่ได้กด Request Indexing แทน browser
- Deploy production ต้องใช้ `wrangler pages deploy dist/ --project-name=mooma-online --branch=main --commit-dirty=true`
- อย่าใส่คำที่ no-price scanner บล็อกใน source files
