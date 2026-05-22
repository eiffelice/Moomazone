# PITFALLS.md — Common Issues & Solutions

## 1. Shopee Scraping — DON'T DO IT

Shopee is fully bot-proof. All automation approaches fail:
- **REST API** → returns empty without auth
- **curl / wget** → HTML is client-rendered React (empty body)
- **Headless browsers** (Puppeteer, Playwright) → Cloudflare challenge blocks
- **Google cache** → no cached pages for Shopee product URLs
- **Mobile endpoints** → require authentication

**Solution:** Ask the user for product details directly. Use the submission template:
```
🔗 ลิงก์: [Shopee link]
📌 ชื่อสินค้า:
🖼️ รูปสินค้า: [URL รูป]
⭐ จุดเด่น:
  -
```

Never attempt to scrape. It wastes time and may trigger IP bans.

## 2. Cloudflare Cache After Deploy

After `wrangler pages deploy`, Cloudflare may serve cached (old) content.

**Symptoms:** User says "เว็บยังไม่เปลี่ยน" even though deploy succeeded.

**Verification steps:**
1. `curl -s https://mooma.online | wc -c` — compare with `wc -c dist/index.html`
2. If sizes match → site IS updated, it's a cache issue
3. If sizes differ → deploy may have failed, check wrangler output

**Cache fixes (tell user):**
1. Ctrl+Shift+R (hard refresh)
2. Open incognito/private window
3. Check preview URL: `xxx.mooma-online.pages.dev`
4. Purge Cloudflare cache (Dashboard → Caching → Purge Everything)

## 3. Astro `<` Syntax Bug

Astro interprets `<` in template text as HTML tag open → build fails.

**Fix:** Use `&lt;` instead of raw `<` in text:
```
<!-- ❌ -->
<p>น้อยกว่า < 0.5 มก.</p>
<!-- ✅ -->
<p>น้อยกว่า &lt; 0.5 มก.</p>
```

## 4. Wrangler Auth Errors

| Error Code | Meaning | Fix |
|-----------|---------|-----|
| `10000` | Token lacks Pages:Edit permission | Create new token with "Cloudflare Pages:Edit" template |
| `9109` | IP filtering blocks server | Remove IP filter or add server IP |
| `8000007` | Project doesn't exist | Run `wrangler pages project create mooma-online --production-branch=main` first |

## 5. Build Failures

### No-Price Scanner blocks build
Found `฿`, `บาท`, `ราคา`, or other banned terms in source files.

**Fix:** Replace all occurrences:
- `ราคา` → remove or use "คุ้มค่า" / "ประหยัด"
- `฿XXX` → use value indicators (💰💰💰)
- CTA text: "ซื้อที่ Shopee" (never "ดูราคา...")

### Disclosure Check blocks build
Product or compare pages missing affiliate disclosure.

**Fix:** Add this block before `</Layout>`:
```html
<div style="max-width:780px;margin:0 auto;padding:16px 0;">
  <p style="font-size:0.82em;color:var(--gray-300);text-align:center;">
    * บางลิงก์เป็น Affiliate Link — หากคุณสั่งซื้อผ่านลิงก์นี้ เราอาจได้รับค่าคอมมิชชั่น โดยไม่มีผลต่อการตัดสินใจของคุณ โปรดตรวจสอบรายละเอียดสินค้าโดยตรงจากร้านค้าก่อนสั่งซื้อ | <a href="/disclosure">อ่านเพิ่มเติม</a>
  </p>
</div>
```

## 6. DNS Propagation

After adding custom domain to Cloudflare Pages, DNS may take 5-60 minutes to propagate.

**Check:** `dig mooma.online` or visit the `.pages.dev` preview URL.

## 7. No-Price Rule (Hard Rule)

The site owner explicitly forbids displaying price numbers. All of these are BANNED:
- `฿` symbol
- `บาท`
- `ราคา` (except in "คุ้มค่า" — allowed)
- `ลดราคา`, `โปรโมชัน`, `โปรโมชั่น`
- `ส่งฟรี`, `ถูกสุด`, `เหลือเพียง`
- `flash sale`, `discount`, `sale price`

**Allowed alternatives:**
- Value indicators: 💰💰💰 (high), 💰💰 (medium), 💰 (affordable)
- "คุ้มค่า", "ประหยัด", "ลงทุนสูงกว่า"
- CTA: "🛍️ ซื้อที่ Shopee"

## 8. Browser Cache

Users frequently see old content due to browser cache. Always verify server-side first (`curl`) before investigating deploy issues.
