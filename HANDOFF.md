# HANDOFF

## สถานะล่าสุด

เพิ่มหน้ารีวิวสินค้า `น้ำพุแมวอัตโนมัติ เครื่องให้น้ำสัตว์เลี้ยง ระบบกรองน้ำ เสียงเงียบ` และ deploy ขึ้น Cloudflare Pages production/custom domain `https://mooma.online/` เรียบร้อยแล้ว

## งานที่เสร็จแล้ว

### Automatic cat water fountain product page

- สร้างหน้าใหม่ `src/pages/products/automatic-cat-water-fountain.astro`
- ใช้ข้อมูลจากผู้ใช้เท่านั้น: ชื่อสินค้า, หมวดหมู่, Shopee affiliate URL, รูปภาพ 6 รูป, ขนาด, จุดเด่น, กลุ่มที่เหมาะ, SEO title/description/keywords
- ใส่ SEO title/meta description, canonical ผ่าน Layout, OG image, JSON-LD structured data, FAQ, breadcrumb
- ใส่ Shopee affiliate CTA: `https://s.shopee.co.th/5VSQAsJJBH`
- ใส่ `<ShopeeSignupCTA />`, affiliate disclosure และข้อควรรู้เรื่องการล้างเครื่อง/ดูแลตัวกรอง
- เพิ่มข้อมูลสินค้าใน `src/data/products.json` หมวด `smart-pet`
- ปรับหน้า `src/pages/category/smart-pet.astro` จาก placeholder ให้แสดงการ์ดสินค้าแบบ data-driven พร้อม ItemList schema
- เพิ่มการ์ดในหน้า `/reviews/`
- Homepage และหน้า `/category/smart-pet/` จะแสดงสินค้าจาก `products.json`

## ผลตรวจล่าสุด

- `npm run validate` ผ่าน
  - no-price scanner: clean
  - affiliate disclosure check: clean
- `npx astro check` ผ่าน
  - 0 errors
  - 0 warnings
  - 1 hint เดิมจาก `document.execCommand('copy')` ใน ShareButtons fallback
- `npm run build` ผ่าน
  - generated 31 pages
  - sitemap alias สำเร็จ
- `npm run health` ผ่าน
  - checked 31 routes from `dist/`
- ตรวจคำต้องห้ามผ่าน: ไม่พบ `รักษาเชื้อรา`, `หายแน่นอน`, `ขับก้อนขนหาย`, `ลดกลิ่นปากหาย`, `ราคา`, `โปรโมชัน` ใน `src/`
- Production/custom domain spot-check ผ่าน: `https://mooma.online/products/automatic-cat-water-fountain/` HTTP 200 และพบชื่อสินค้า + affiliate code `5VSQAsJJBH`
- หน้า category spot-check ผ่าน: `https://mooma.online/category/smart-pet/` พบสินค้าใหม่
- Submitted sitemap เข้า Google Search Console แล้ว

## งานที่ยังค้าง

- Google อาจยังไม่ index หน้าใหม่ทันที เพราะเพิ่ง deploy

## สิ่งที่ต้องทำต่อ

1. รอ Google crawl 24–72 ชั่วโมง แล้วตรวจ Search Console
2. ถ้ายังไม่ index ให้ใช้ GSC request indexing สำหรับ `https://mooma.online/products/automatic-cat-water-fountain/`

## คำเตือน

- อย่าใส่คำที่ no-price scanner บล็อก เช่น “ราคา”, “โปรโมชัน” ใน source files
- Shopee scrape ไม่ได้ ให้ใช้ข้อมูลสินค้าที่ผู้ใช้ส่งมาเท่านั้น
- สำหรับสินค้าให้น้ำ/สุขภาพสัตว์ อย่าเขียน claim แรงว่าป้องกันโรคหรือรักษาโรค ให้ใช้ wording เชิงความสะดวก/การดูแลและใส่ข้อควรรู้
- อย่าฝัง token/secret ใน command หรือให้ผู้ใช้แปะ token ใน chat ถ้าเลี่ยงได้
