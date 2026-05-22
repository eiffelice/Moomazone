import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF7F2"/>
      <stop offset="55%" stop-color="#FFFDF8"/>
      <stop offset="100%" stop-color="#FFE6DC"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#3B2B27" flood-opacity="0.14"/>
    </filter>
  </defs>

  <rect width="1200" height="630" rx="0" fill="url(#bg)"/>
  <circle cx="1040" cy="90" r="120" fill="#FFD7CE" opacity="0.55"/>
  <circle cx="100" cy="560" r="155" fill="#FFF0D9" opacity="0.75"/>
  <circle cx="1120" cy="540" r="90" fill="#E8F7EE" opacity="0.9"/>

  <rect x="78" y="78" width="1044" height="474" rx="38" fill="#FFFFFF" filter="url(#shadow)"/>

  <g transform="translate(118,116)">
    <circle cx="30" cy="32" r="17" fill="#FF765F"/>
    <circle cx="66" cy="32" r="17" fill="#FF765F"/>
    <circle cx="18" cy="70" r="17" fill="#FF765F"/>
    <circle cx="78" cy="70" r="17" fill="#FF765F"/>
    <ellipse cx="48" cy="72" rx="31" ry="25" fill="#FF765F"/>
  </g>

  <text x="225" y="165" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="800" fill="#232323" letter-spacing="-1">mooma.online</text>
  <text x="118" y="255" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="#232323">Pet reviews for smarter buys</text>
  <text x="118" y="320" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="#FF765F">Honest picks from Shopee Thailand</text>

  <g font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#5E5E5E">
    <text x="118" y="415">Dog Food</text>
    <circle cx="253" cy="405" r="5" fill="#FF765F"/>
    <text x="278" y="415">Cat Food</text>
    <circle cx="408" cy="405" r="5" fill="#FF765F"/>
    <text x="433" y="415">Cat Litter</text>
    <circle cx="575" cy="405" r="5" fill="#FF765F"/>
    <text x="600" y="415">Grooming</text>
    <circle cx="745" cy="405" r="5" fill="#FF765F"/>
    <text x="770" y="415">Smart Pet</text>
  </g>

  <g transform="translate(925,352)" stroke="#232323" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M55 45 L92 10 L104 60 Q142 88 127 135 Q111 186 55 186 Q-1 186 -17 135 Q-32 88 6 60 L18 10 Z" fill="#FFF7F2"/>
    <circle cx="30" cy="102" r="7" fill="#232323" stroke="none"/>
    <circle cx="82" cy="102" r="7" fill="#232323" stroke="none"/>
    <path d="M56 123 L47 137 L65 137 Z" fill="#FF765F" stroke="none"/>
    <path d="M28 150 Q56 170 84 150"/>
    <path d="M8 125 H-26 M5 145 H-30 M105 125 H139 M108 145 H143" stroke-width="7"/>
  </g>

  <rect x="118" y="462" width="292" height="48" rx="24" fill="#232323"/>
  <text x="148" y="496" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">READ REVIEWS FREE</text>
</svg>`;

writeFileSync('public/og-default.svg', svg);
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('Generated public/og-default.png and public/og-default.svg');
