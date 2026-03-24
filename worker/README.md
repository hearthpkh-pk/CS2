# Worker: Facebook Page Health Checker

ระบบ Background Service สำหรับรันเช็คสถานะบัญชีและเพจ Facebook အัตโนมัติตามช่วงเวลา

## สถาปัตยกรรมปัจจุบัน (Phase 1)
แบบพึ่งพาไฟล์ (File-based): ดึงรายชื่อเพจเป้าหมายจาก `config.json` (`pagesToCheck`) และแสดงผลลัพธ์ออกทางลานสายตา (Console Log)

---

## แผนการเชื่อมต่อระบบในอนาคต (Phase 2 - Database Integration)

เมื่อโปรเจกต์หลัก (Next.js) ทำการเชื่อมต่อเข้ากับ Database จริง (เช่น Supabase หรือ PostgreSQL) เรียบร้อยแล้ว ตัว Worker ตัวนี้จะต้องถูกปรับแก้ไขตาม Roadmap ด้านล่างนี้:

### 1. การดึงข้อมูลเพจ (Fetch Input)
* **สิ่งที่จะยุติ:** เลิกใช้ก้อนข้อมูล `pagesToCheck` ในหน้า `config.json`
* **สิ่งที่จะเปลี่ยนไป:** 
  * ใช้ไลบรารีอย่าง `axios` หรือ `@supabase/supabase-js` เพื่อยิง API/Query เข้าไปที่ตาราง `Pages` (หรือตาราง `Accounts` แล้วแต่ว่าเช็คอะไร)
  * **Condition:** สั่งให้ดึงเฉพาะเพจที่มีสถานะเป็น `Status = 'Active'` เท่านั้นมาเข้าคิวรันเช็ค เพจที่พักอยู่ (Rest) หรือเพจพังแล้ว (Die) ไม่ต้องดึงมาให้เปลืองเวลา

### 2. การอัปเดตสถานะกลับ (Update Result)
* **สิ่งที่จะยุติ:** เลิกแค่ `console.log` ให้คนนั่งดู
* **สิ่งที่จะเปลี่ยนไป:**
  * เมื่อบอทตรวจสอบพบว่าเช็คแล้วติดสถานะ `status: 'broken'`
  * ให้ออกคำสั่ง `UPDATE` กลับไปยัง Database ชี้เป้าไปที่ `page.id` นั้น 
  * ปรับค่า Status ในตารางเป็น `'Problem'` หรือ `'Die'` (พร้อมประทับเวลาว่าเพจตายเมื่อไหร่ `updatedAt`)

### 3. การแจ้งเตือน (Notifications / Telegram)
* **สิ่งที่จะเพิ่มเข้ามา:** 
  * เตรียมเก็บ `TELEGRAM_BOT_TOKEN` และ `TELEGRAM_CHAT_ID` เอาไว้ในไฟล์ `.env` ของ Worker
  * เมื่อจบการทำงานของลูปเช็คเพจ ให้รวบรวม Array ของชื่อเพจที่เปลี่ยนสถานะเป็นพัง
  * ถ้า Array > 0 (มีเพจตายอย่างน้อย 1 เพจในรอบนั้น) ให้ยิง HTTP POST ไปหา Telegram API พร้อมรายละเอียดว่า:
    _"🔴 แจ้งเตือนด่วน: พบเพจบินจำนวน X เพจ 1. เพจ A 2. เพจ B (อัพเดตสถานะในระบบเรียบร้อย)"_

## ข้อกำหนดทางโครงสร้าง (Infrastructure Notes)
* การรัน Worker นี้บน Production จริง ควรจับแยกออกจาก Server ของ Frontend (Next.js) เนื่องจาก Puppeteer กินพื้นที่ Memory และ CPU เวลารัน
* ตัวเลือกที่เหมาะสมคือการใช้ Server ขนาดเล็ก (เช่น AWS EC2 t3.micro หรือ DigitalOcean Droplet 1GB) และดูแล Process ผ่าน `PM2` (เช่นคำสั่ง `pm2 start health-checker.js`) เพื่อให้ Worker รันเกาะติด 24 ชั่วโมงและทำงานตามรอบ cron ที่กำหนดไว้
