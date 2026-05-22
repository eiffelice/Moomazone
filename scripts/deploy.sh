#!/usr/bin/env bash
# deploy.sh — Validate, build, and deploy mooma.online to Cloudflare Pages
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 mooma.online Deploy Pipeline"
echo "================================"

# Step 1: Validation
echo ""
echo "🔍 Step 1/5: No-Price Scanner..."
bash scripts/no-price-check.sh

echo ""
echo "📋 Step 2/5: Affiliate Disclosure Check..."
bash scripts/check-disclosure.sh

# Step 3: Astro check
echo ""
echo "✅ Step 3/5: Astro type-check..."
npx astro check

# Step 4: Build
echo ""
echo "🏗️  Step 4/5: Build..."
npm run build

# Step 5: Deploy
echo ""
echo "📤 Step 5/5: Deploy to Cloudflare Pages..."

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not set. Set it and retry."
  exit 1
fi

wrangler pages deploy dist/ --project-name=mooma-online

echo ""
echo "🌐 Verifying deployment..."
sleep 3

# Verify key URLs
HOME_CHECK=$(curl -sI https://mooma.online/ 2>/dev/null | head -1)
SITEMAP_CHECK=$(curl -sI https://mooma.online/sitemap.xml 2>/dev/null | head -1)
ROBOTS_CHECK=$(curl -sI https://mooma.online/robots.txt 2>/dev/null | head -1)

echo "  Homepage:    $HOME_CHECK"
echo "  Sitemap:     $SITEMAP_CHECK"
echo "  Robots.txt:  $ROBOTS_CHECK"

echo ""
echo "✅ Deploy complete! 🎉"
echo "   https://mooma.online"
