#!/usr/bin/env bash
# no-price-check.sh — Scan source files for banned price-related terms
# Exit code 1 = banned terms found → build fails
# Exit code 0 = clean

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

# Banned Thai terms
BANNED_TH=(
  "฿"
  "บาท"
  "ราคา"
  "ลดราคา"
  "โปรโมชัน"
  "โปรโมชั่น"
  "ส่งฟรี"
  "ถูกสุด"
  "เหลือเพียง"
  "flash sale"
  "discount"
  "sale price"
)

FOUND=false

echo "🔍 No-Price Scanner — checking $SRC_DIR ..."

for pattern in "${BANNED_TH[@]}"; do
  if matches=$(grep -rIn --include="*.astro" --include="*.md" --include="*.mdx" --include="*.json" --include="*.ts" \
    -e "$pattern" "$SRC_DIR" 2>/dev/null); then
    while IFS= read -r line; do
      echo "❌ BANNED: '$pattern' → $line"
    done <<< "$matches"
    FOUND=true
  fi
done

# Also check for price number patterns (฿ followed by digits, or digits followed by บาท)
if matches=$(grep -rPn --include="*.astro" --include="*.md" --include="*.mdx" --include="*.json" --include="*.ts" \
  -e '฿\s*\d' -e '\d+\s*บาท' "$SRC_DIR" 2>/dev/null); then
  while IFS= read -r line; do
    echo "❌ BANNED (number pattern): $line"
  done <<< "$matches"
  FOUND=true
fi

if $FOUND; then
  echo ""
  echo "⛔ BUILD FAILED: Found banned price terms in source files."
  echo "   Remove all price references before building."
  exit 1
else
  echo "✅ No banned price terms found — clean!"
  exit 0
fi
