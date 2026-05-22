# SEO Rules — mooma.online

## หลักการ SEO ภาษาไทย

### 1. Keyword Strategy
- **Thai-first** — ใช้คีย์เวิร์ดภาษาไทยเป็นหลัก Google อ่านภาษาไทยได้ดี
- **Long-tail keywords** — เน้น problem-based queries ที่คนไทยค้นหาจริง
- **Stack 2-3 keywords** ใน title tag
- **Nest related terms** ใน H2/H3 headers

### 2. Keyword Categories

**Problem-based (เน้นเป็นพิเศษ):**
- อาหารสุนัขแพ้ง่าย
- หมาขนร่วงกินอะไรดี
- อาหารแมวขนสวย
- อุปกรณ์เลี้ยงสัตว์ที่จำเป็น
- ของใช้สัตว์เลี้ยงมือใหม่
- กระบะทรายแมวเก็บกลิ่น
- ขนมขัดฟันสุนัข
- อาหารเปียกแมวบำรุงขน

**Product-specific:**
- [ชื่อสินค้า] รีวิว
- [ชื่อสินค้า] ดีไหม
- [ชื่อสินค้า] วิธีใช้

### 3. On-Page SEO Rules

| Rule | Required |
|------|----------|
| `<title>` — unique, 40-60 chars, 2-3 keywords | ✅ Every page |
| `<meta description>` — 120-155 chars, compelling | ✅ Every page |
| Single `<h1>` per page | ✅ |
| H2/H3 hierarchy (no skipping levels) | ✅ |
| Internal links → category, compare, other products | ✅ |
| CTA to Shopee (no price) | ✅ |
| Affiliate disclosure near CTA + footer | ✅ |
| Image `alt` text in Thai | ✅ |

### 4. Prohibited Practices

- ❌ Keyword stuffing (unnatural repetition)
- ❌ False claims / แต่งข้อมูลเกินจริง
- ❌ Fake reviews — ถ้าไม่มีข้อมูลจริงให้เขียน "ควรตรวจสอบรายละเอียดจากร้านค้าก่อนสั่งซื้อ"
- ❌ Hidden text or cloaking
- ❌ NO prices anywhere (site-wide hard rule)

### 5. Technical SEO

- ✅ `sitemap.xml` — auto-submitted to GSC
- ✅ `robots.txt` — allow all, point to sitemap
- ✅ HTTPS via Cloudflare
- ✅ Mobile responsive (CSS media queries)
- ✅ Semantic HTML (`<article>`, `<section>`, `<nav>`, `<details>`)
- ✅ `<link rel="canonical">` (handled by Astro)
- ✅ Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`)

### 6. Content Quality Standards

- Review must cover: what it is, benefits, who it's for, how to use, FAQ
- FAQ minimum 4 questions with `<details>` elements
- Comparison articles: summary + table + deep dive + verdict + FAQ
- Show both strengths AND limitations (balanced review)
- Natural Thai language — no machine-translation feel
