#!/usr/bin/env bash
# check-disclosure.sh — Verify affiliate disclosure on all product/compare pages
# Exit 1 = missing disclosure
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

FOUND=false

echo "🔍 Affiliate Disclosure Check — scanning $SRC_DIR ..."

DISCLOSURE_TEXT="บทความนี้มีลิงก์แอฟฟิลิเอต"
REQUIRED_REL='rel="nofollow sponsored"'

# Check every product page
for file in "$SRC_DIR"/pages/products/*.astro "$SRC_DIR"/pages/compare/*.astro "$SRC_DIR"/pages/index.astro; do
  [ -f "$file" ] || continue

  basename="$(basename "$file")"

  # Check disclosure text
  if ! grep -q "$DISCLOSURE_TEXT" "$file" 2>/dev/null && ! grep -q "ลิงก์แอฟฟิลิเอต" "$file" 2>/dev/null && ! grep -q "Affiliate" "$file" 2>/dev/null; then
    echo "❌ MISSING disclosure: $basename"
    FOUND=true
  fi

  # Check for direct Shopee anchors with wrong rel. ProductCard handles rel at render time.
  if grep -Eiq 'href=\{?"?[^"}]*shopee|href="https://s\.shopee' "$file" 2>/dev/null; then
    if ! grep -q "$REQUIRED_REL" "$file" 2>/dev/null; then
      echo "⚠️  WARNING: Direct Shopee links may lack rel=\"nofollow sponsored\" → $basename"
    fi
  fi
done

if $FOUND; then
  echo ""
  echo "⛔ BUILD FAILED: Missing affiliate disclosure on some pages."
  exit 1
else
  echo "✅ All pages have affiliate disclosure — clean!"
  exit 0
fi
