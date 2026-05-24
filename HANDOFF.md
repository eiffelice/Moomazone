# HANDOFF

## สถานะล่าสุด

เพิ่มหน้ารีวิวสินค้า `เมล็ดข้าวสาลีสำหรับสัตว์เลี้ยง ปลอดสารเคมี และดินพร้อมปลูก` และ deploy ขึ้น Cloudflare Pages production/custom domain `https://mooma.online/` เรียบร้อยแล้ว

## งานที่เสร็จแล้ว

### Pet wheatgrass seeds and soil product page

- สร้างหน้าใหม่ `src/pages/products/pet-wheatgrass-seeds-soil-kit.astro`
- ใช้ข้อมูลจากผู้ใช้เท่านั้น: ชื่อสินค้า, รูปภาพ 5 รูป, หมวดหมู่, จุดเด่น, ตัวเลือกสินค้า, วิธีใช้งาน/ดูแล, Shopee affiliate URL
- ใส่ SEO title/meta description, canonical ผ่าน Layout, OG image, JSON-LD structured data, FAQ, breadcrumb
- ใส่ Shopee affiliate CTA: `https://s.shopee.co.th/1gFhY38BnC`
- ใส่ `<ShopeeSignupCTA />`, affiliate disclosure และคำเตือนเรื่องสุขภาพ/ไม่ใช้แทนคำแนะนำสัตวแพทย์
- เพิ่มข้อมูลสินค้าใน `src/data/products.json` หมวด `supplements`
- ปรับหน้า `src/pages/category/supplements.astro` จาก placeholder ให้แสดงการ์ดสินค้าแบบ data-driven
- เพิ่มการ์ดในหน้า `/reviews/`
- Homepage และหน้า `/category/supplements/` จะแสดงสินค้าจาก `products.json`

## ผลตรวจล่าสุด

- `npm run validate` ผ่าน
  - no-price scanner: clean
  - affiliate disclosure check: clean
- `npx astro check` ผ่าน
  - 0 errors
  - 0 warnings
  - 1 hint เดิมจาก `document.execCommand('copy')` ใน ShareButtons fallback
- `npm run build` ผ่าน
  - generated 30 pages
  - sitemap alias สำเร็จ
- `npm run health` ผ่าน
  - checked 30 routes from `dist/`
- ตรวจคำต้องห้ามผ่าน: ไม่พบ `รักษาเชื้อรา`, `หายแน่นอน`, `ขับก้อนขนหาย`, `ลดกลิ่นปากหาย`, `ราคา`, `โปรโมชัน` ใน `src/`
- Production/custom domain spot-check ผ่าน: `https://mooma.online/products/pet-wheatgrass-seeds-soil-kit/` HTTP 200 และพบชื่อสินค้า + affiliate code `1gFhY38BnC`
- Submitted sitemap เข้า Google Search Console แล้ว

## งานที่ยังค้าง

- Google อาจยังไม่ index หน้าใหม่ทันที เพราะเพิ่ง deploy

## สิ่งที่ต้องทำต่อ

1. รอ Google crawl 24–72 ชั่วโมง แล้วตรวจ Search Console
2. ถ้ายังไม่ index ให้ใช้ GSC request indexing สำหรับ `https://mooma.online/products/pet-wheatgrass-seeds-soil-kit/`

## คำเตือน

- อย่าใส่คำที่ no-price scanner บล็อก เช่น “ราคา”, “โปรโมชัน” ใน source files
- อย่าเขียน claim แรงว่าแก้ก้อนขน/กลิ่นปากได้แน่นอน ให้ใช้ wording ตามข้อมูลผู้ขายและใส่ disclaimer
- Shopee scrape ไม่ได้ ให้ใช้ข้อมูลสินค้าที่ผู้ใช้ส่งมาเท่านั้น
- อย่าฝัง token/secret ใน command หรือให้ผู้ใช้แปะ token ใน chat ถ้าเลี่ยงได้
