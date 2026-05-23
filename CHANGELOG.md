# CHANGELOG

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
