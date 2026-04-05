-- # 06_add_links_to_logs.sql
-- 🛠️ เพิ่มฟิลด์สำหรับเก็บลิงก์วิดีโอ (URLs) ในตารางส่งงานรายวัน

ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- อธิบาย: เราใช้ JSONB เพื่อให้ยืดหยุ่น สามารถเก็บกี่ลิงก์ก็ได้ตามโควต้าของกลุ่มพนักงาน
-- เช่น ["https://...", "https://..."]
