# CHANGELOG

## 2026-05-24 — Pet wheatgrass seeds and soil product page

- Added `src/pages/products/pet-wheatgrass-seeds-soil-kit.astro` with Thai SEO review content, Shopee affiliate CTA, 5-image gallery, FAQ, structured data, affiliate disclosure, and Shopee signup CTA.
- Added the product to `src/data/products.json` under `supplements` so it appears on homepage and supplements category pages.
- Updated `src/pages/category/supplements.astro` from placeholder content to data-driven product cards.
- Added a review card to `src/pages/reviews.astro`.
- Used only user-provided product facts and safe wording for hairball/breath claims.

## 2026-05-24 — Thai Doctor herbal dog shampoo product page

- Added `src/pages/products/thai-doctor-herbal-dog-shampoo.astro` with Thai SEO review content, Shopee affiliate CTA, 5-image gallery, FAQ, structured data, affiliate disclosure, and Shopee signup CTA.
- Added the product to `src/data/products.json` under `grooming` so it appears on homepage and grooming category pages.
- Added a review card to `src/pages/reviews.astro`.
- Used only user-provided product facts and safe wording: no strong treatment claims such as curing fungus or guaranteed results.
- Verification passed: `npm run validate`, `npx astro check` (0 errors, 1 existing deprecated execCommand hint), `npm run build`, and `npm run health`.

## 2026-05-24 — Bite of Wild P42 cat food product page

- Added `src/pages/products/bite-of-wild-p42-cat-food.astro` with Thai SEO review content, Shopee affiliate CTA, image gallery, FAQ, structured data, affiliate disclosure, and Shopee signup CTA.
- Added Bite of Wild P42 to `src/data/products.json` under `cat-food` so it appears on homepage and category pages.
- Added a Bite of Wild card to `src/pages/reviews.astro`.
- Verification passed: `npm run validate`, `npx astro check` (0 errors), `npm run build`, and `npm run health`.
- Deployed to Cloudflare Pages production/custom domain and verified live product page, homepage, cat-food category, reviews, and sitemap child URL.
- Submitted sitemap to Google Search Console; new product URL is currently `URL is unknown to Google`, which is expected immediately after publishing.

## 2026-05-24 — Improve share buttons

- Redesigned `ShareButtons.astro` as a card-style share module with clearer Thai copy and stronger mobile layout.
- Added native Web Share API button for supported devices, while keeping Facebook, LINE, X, and copy-link fallbacks.
- Reworked copy-link UX with secure clipboard fallback and live status message.
- Refined the module again with warmer Thai copy, explanatory subtitle, paw badge, larger tap targets, better desktop button proportions, LINE share text, desktop popup sharing, and a green copied state for clearer feedback.
- Updated `public/style.css` for responsive two-column / one-column mobile behavior, larger tap targets, focus states, and premium visual styling.
- Verification passed: `npm run validate`, `npm run build`, and `npm run health`.
- Deployed to Cloudflare Pages production/custom domain and verified `https://mooma.online/` returns the new share module.

## 2026-05-23 — SEO informational articles, cat + dog clusters

### Dog article cluster

- Added 3 Thai SEO informational articles under `src/pages/articles/`:
  - `dog-not-eating-guide.astro`
  - `dog-dental-chews-guide.astro`
  - `dog-bad-breath-solution.astro`
- Updated `src/pages/index.astro` article section to include the new dog article cards.
- Updated `src/pages/reviews.astro` to surface the dog articles near the top.
- Each article includes:
  - SEO title and meta description
  - canonical URL via `Layout.astro`
  - `BlogPosting`, `FAQPage`, and `BreadcrumbList` JSON-LD via `productArticleSchema()`
  - internal links to related dog product/category pages (`dog-food`, `dog-treats`, `grooming`, Kin-D, Gentle Paws)
  - affiliate disclosure text

### Cat article cluster

- Added 3 Thai SEO informational articles under `src/pages/articles/`:
  - `cat-pee-smell-solution.astro`
  - `cat-food-skin-coat-guide.astro`
  - `cat-condo-new-owner-checklist.astro`
- Updated `src/pages/reviews.astro` to surface the 3 new article cards near the top.
- Added homepage `#articles` section for recommended articles.

### Verification

- `npm run validate` passed
- `npm run build` passed and generated 27 pages after dog cluster
- `npm run health` passed
- Production deploy completed with Cloudflare Pages (`--branch=main --commit-dirty=true`)
- Production spot-check passed: new dog URLs, homepage, and `/reviews/` returned HTTP 200 and JSON-LD

Notes:
- No product facts were invented beyond general pet-care guidance and existing site product links.
- No banned source terms were introduced; no-price scanner passed.
