-- # 02_personnel_schema.sql
-- 🛠️ ตารางการลางาน (Leave Management - ฉบับปรับปรุง)

-- 1. ENUMS (ตั้งค่าประเภทข้อมูลเพื่อป้องกันข้อบกพร่อง)
CREATE TYPE leave_type AS ENUM ('Vacation', 'Sick', 'Personal', 'Unpaid', 'Other');

-- 2. ตารางแบบฟอร์มการลางาน
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- กฎ: ลาเต็มวันเท่านั้น (ใส่เลขจำนวนเต็ม)
    total_days INTEGER NOT NULL CHECK (total_days > 0),
    
    reason TEXT NOT NULL,
    
    -- สถานะยกเลิกใบลา (ไม่มี Pending/Approved ถือว่าลาได้เลย)
    is_cancelled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- เช็กความสมเหตุสมผล: วันสิ้นสุดการลา ต้องไม่อยู่ก่อนวันเริ่มต้นการลา
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 3. เปิดใช้งาน RLS สำหรับการลางาน
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 🛡️ นโยบายที่ 1: การดูใบลา
-- พนักงานเห็นแค่ของตัวเอง / Super Admin เห็นของทุกคน
CREATE POLICY "View leaves policy" ON public.leave_requests
FOR SELECT TO authenticated
USING ( 
  staff_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
);

-- 🛡️ นโยบายที่ 2: การขอลางาน (ต้องไม่ลาย้อนหลัง)
-- พนักงานยื่นใบลาตัวเองได้ และ "วันเริ่มต้นลาต้องไม่ใช่วันในอดีต (>= วันที่ปัจจุบัน)"
CREATE POLICY "Insert own leaves policy" ON public.leave_requests
FOR INSERT TO authenticated
WITH CHECK ( 
  staff_id = auth.uid() AND 
  start_date >= CURRENT_DATE 
);

-- 🛡️ นโยบายที่ 3: การยกเลิกใบลาของพนักงาน
-- พนักงานอัปเดตใบลาตัวเองได้ (กรณีต้องการกดยกเลิก `is_cancelled = true`) 
CREATE POLICY "Update own leaves to cancel" ON public.leave_requests
FOR UPDATE TO authenticated
USING ( 
  staff_id = auth.uid()
)
WITH CHECK (
  staff_id = auth.uid()
);

-- 🛡️ นโยบายที่ 4: สำหรับ Super Admin
-- Super Admin สามารถแก้ไข/ลบ ข้อมูลของทุกคนได้ทุกกรณี
CREATE POLICY "Super Admin update leaves policy" ON public.leave_requests
FOR UPDATE TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
);

CREATE POLICY "Super Admin delete leaves policy" ON public.leave_requests
FOR DELETE TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Super Admin'
);
