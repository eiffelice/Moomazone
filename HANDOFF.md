# HANDOFF

## สถานะล่าสุด

เพิ่มหน้ารีวิวสินค้า Bite of Wild อาหารแมว P42 5 กก. Grain Free โปรตีน 42% ลง mooma.online แล้ว และ deploy ขึ้น Cloudflare Pages production/custom domain `https://mooma.online/` เรียบร้อยแล้ว ยังไม่ได้ commit/push งานเข้า Git remote

## งานที่เสร็จแล้ว

### Bite of Wild P42 product page

- สร้างหน้าใหม่ `src/pages/products/bite-of-wild-p42-cat-food.astro`
- ใช้ข้อมูลจากผู้ใช้เท่านั้น: ชื่อสินค้า, รูปภาพ, รายละเอียด, โภชนาการ, จุดเด่น, Shopee affiliate URL
- เพิ่มรูปสินค้า 7 รูปใน gallery
- ใส่ SEO title/meta description, canonical ผ่าน Layout, OG image, JSON-LD structured data, FAQ, breadcrumb
- ใส่ Shopee affiliate CTA: `https://s.shopee.co.th/1100areaTP`
- ใส่ `<ShopeeSignupCTA />` ตาม workflow ของ mooma.online
- ใส่ affiliate disclosure และคำเตือนเรื่องสุขภาพแมว/สูตรโปรตีนสูง
- เพิ่มข้อมูลสินค้าใน `src/data/products.json` หมวด `cat-food`
- เพิ่มการ์ดในหน้า `/reviews/`
- Homepage และหน้า `/category/cat-food/` แสดงสินค้าจาก `products.json` แล้ว

### Deploy / GSC

- Deploy Cloudflare Pages production สำเร็จ
- Preview URL: `https://ff4b0d8e.mooma-online.pages.dev`
- Submitted sitemap เข้า Google Search Console แล้ว
- URL Inspection ล่าสุด: `https://mooma.online/products/bite-of-wild-p42-cat-food/` = `URL is unknown to Google` ซึ่งเป็นสถานะปกติของ URL ที่เพิ่งเผยแพร่

## ผลตรวจล่าสุด

- `npm run validate` ผ่าน
  - no-price scanner: clean
  - affiliate disclosure check: clean
- `npx astro check` ผ่าน
  - 0 errors
  - 0 warnings
  - 1 hint เดิมจาก `document.execCommand('copy')` ใน ShareButtons fallback
- `npm run build` ผ่าน
  - generated 28 pages
  - sitemap alias สำเร็จ
- `npm run health` ผ่าน
  - checked 28 routes from `dist/`
- Production/custom domain spot-check ผ่าน
  - `https://mooma.online/products/bite-of-wild-p42-cat-food/` HTTP 200 และพบ `Bite of Wild`, `1100areaTP`, structured data
  - `https://mooma.online/` HTTP 200 และพบสินค้าใหม่
  - `https://mooma.online/category/cat-food/` HTTP 200 และพบสินค้าใหม่
  - `https://mooma.online/reviews/` HTTP 200 และพบการ์ดสินค้าใหม่
  - `https://mooma.online/sitemap-0.xml` HTTP 200 และพบ URL สินค้าใหม่

## งานที่ยังค้าง

- ยังไม่ได้ commit/push งานเข้า Git remote
- Google ยังไม่ index หน้า Bite of Wild เพราะเพิ่งเผยแพร่

## สิ่งที่ต้องทำต่อ

1. รอ Google crawl 24–72 ชั่วโมง แล้วรัน `INSPECT_LIMIT=28 npm run seo:gsc:inspect`
2. ถ้าหลัง 2–3 วันยัง `URL is unknown to Google` ให้ใช้ GSC browser กด Request Indexing สำหรับ URL สินค้า
3. ถ้าต้องการเก็บประวัติ repo ให้ commit งานนี้ใน branch ปัจจุบัน

## คำเตือน

- อย่าใส่คำที่ no-price scanner บล็อก เช่น “ราคา”, “โปรโมชัน” ใน source files
- Shopee scrape ไม่ได้ ให้ใช้ข้อมูลสินค้าที่ผู้ใช้ส่งมาเท่านั้น
- สูตร Bite of Wild P42 เป็นโปรตีนสูง แมวมีโรคประจำตัว/โรคไตควรปรึกษาสัตวแพทย์ก่อนเปลี่ยนอาหาร
