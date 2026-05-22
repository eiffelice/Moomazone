# mooma.online Growth Roadmap

สถานะ: เว็บเปิดได้แล้ว เฟสถัดไปคือวัดผล → โต SEO → กันพัง → scale content

## Weekly Dashboard Metrics

ใช้เมื่อ Cloudflare Web Analytics หรือ GA4 ถูกต่อ ENV แล้ว:

- Sessions / pageviews by page
- Top landing pages
- Top outbound affiliate clicks
- `product_click` by product slug
- `affiliate_cta_click` by product slug + location
- `category_click` by category
- `compare_article_click` by article slug
- CTR = affiliate clicks / pageviews
- Search Console impressions / clicks / CTR / average position
- Pages with high impressions but low CTR
- Pages with clicks but low affiliate CTR

## Event Naming Contract

Implemented in `src/components/Analytics.astro`:

- `product_click`
- `affiliate_cta_click`
- `category_click`
- `compare_article_click`

Common params:

- `event_category`
- `event_label`
- `link_url`
- `item_id`
- `location`
- `page_path`

## First 30 SEO Articles

### Problem / How-to Cluster

1. อาหารสุนัขยี่ห้อไหนดี สำหรับสุนัขโต
2. อาหารสุนัขแพ้ง่าย เลือกยังไงให้ปลอดภัย
3. หมาขนร่วงกินอะไรดี ต้องดูสารอาหารอะไรบ้าง
4. อาหารแมวขนร่วง เลือกแบบไหนดี
5. แมวไม่ยอมกินน้ำ ใช้น้ำพุแมวดีไหม
6. กระบะทรายแมวเก็บกลิ่น เลือกแบบไหนดี
7. ห้องน้ำแมวระบบปิดเหมาะกับคอนโดไหม
8. ขนมขัดฟันสุนัข กินทุกวันได้ไหม
9. แผ่นเช็ดคราบน้ำตาหมาแมว ใช้ยังไงให้ปลอดภัย
10. ยาหยดหลังแมว ต้องระวังอะไรบ้าง

### Comparison Cluster

11. กระบะทรายแมวระบบปิด vs ระบบเปิด
12. น้ำพุแมว vs ชามน้ำธรรมดา
13. อาหารเม็ด vs อาหารเปียกแมว
14. ขนมขัดฟัน vs แปรงฟันสุนัข
15. แผ่นเช็ดหู vs น้ำยาล้างหูสัตว์เลี้ยง
16. อาหารสุนัขกระสอบใหญ่ vs ถุงเล็ก
17. ทรายเต้าหู้ vs ทรายเบนโทไนท์
18. คอนโดแมวตั้งพื้น vs คอนโดแมวติดผนัง
19. เครื่องให้อาหารอัตโนมัติ vs ให้อาหารเอง
20. แชมพูสัตว์เลี้ยงสูตรอ่อนโยน vs สูตรลดกลิ่น

### Best-list Cluster

21. ของใช้หมาแมวมือใหม่ที่ควรมี
22. ของใช้แมวคอนโด พื้นที่น้อย
23. ของใช้สุนัขบ้านหลายตัว
24. อุปกรณ์กรูมมิ่งสัตว์เลี้ยงที่ควรมี
25. สินค้าแมวช่วยลดกลิ่นในบ้าน
26. สินค้าสุนัขดูแลง่ายสำหรับคนทำงาน
27. ของใช้สัตว์เลี้ยงคุ้มค่าสำหรับ Shopee
28. อาหารเสริมสัตว์เลี้ยงต้องดูอะไรบ้าง
29. ของใช้แมวสูงวัยที่ควรเตรียม
30. ของใช้สุนัขสูงวัยที่ควรเตรียม

## Content Template Requirements

ทุกบทความควรมี:

- Title 40–60 chars, Thai-first keyword
- Meta description 120–155 chars
- H1 เดียว
- H2/H3 เป็นลำดับ
- Internal links อย่างน้อย 3 จุด
- Affiliate disclosure ใกล้ CTA และ footer
- FAQ อย่างน้อย 4 คำถามถ้าเป็นบทความ SEO
- Last updated
- ระวัง health claims โดยเฉพาะอาหารเสริม เห็บหมัด ผิวหนัง ขนร่วง
- ห้ามมีคำต้องห้ามเรื่องราคา: `ราคา`, `บาท`, `฿`, โปร/ลดราคา ฯลฯ

## Operating Cadence

รายสัปดาห์:

1. Export dashboard metrics
2. เลือก 5 หน้า CTR ต่ำเพื่อปรับ title/meta/CTA
3. เขียนบทความใหม่ 5–10 หน้าใน cluster ที่ impression โต
4. รัน `npm run check && npm run build && npm run health && npm run health:external`
5. Deploy
6. บันทึกสิ่งที่เรียนรู้จาก data รอบนั้น
