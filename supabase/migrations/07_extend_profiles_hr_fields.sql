-- # 07_extend_profiles_hr_fields.sql
-- 🛠️ เพิ่ม Column สำหรับระบบ HR Onboarding ลงใน profiles table
-- รองรับ: สถานะพนักงาน, ข้อมูลติดต่อ, ข้อมูลธนาคาร, วันที่เข้า-ออกงาน

-- 1. เพิ่มสถานะการจ้างงาน (Onboarding Lifecycle)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Probation', 'Official', 'Resigned'));

-- 2. ข้อมูลติดต่อ
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 3. ข้อมูลธนาคาร (สำหรับ Payroll)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- 4. วันที่เกี่ยวกับการจ้างงาน
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS enlistment_date DATE,   -- วันเริ่มงาน
  ADD COLUMN IF NOT EXISTS clearance_date DATE;     -- วันสิ้นสุดสัญญา / วันออก

-- 5. ตั้งค่า Default เงินเดือนพื้นฐาน 12,000 บาท (กันกระสุน: ทุก INSERT จากทุก Source)
--    ใช้ INTEGER เพื่อป้องกัน Floating point error ในระบบ Payroll
ALTER TABLE public.profiles
  ALTER COLUMN salary SET DEFAULT 12000;

-- Backfill: พนักงานเดิมที่เงินเดือน 0 หรือ NULL → ตั้งเป็น 12,000
UPDATE public.profiles
  SET salary = 12000
  WHERE salary IS NULL OR salary = 0;

-- 6. ตั้งค่า Default: พนักงานที่มีข้อมูลอยู่แล้ว (is_active = true) ให้เป็น Official
UPDATE public.profiles
  SET status = 'Official'
  WHERE is_active = true AND status = 'Pending';

-- 6. Comment อธิบาย Column
COMMENT ON COLUMN public.profiles.status IS 'Onboarding status: Pending | Probation | Official | Resigned';
COMMENT ON COLUMN public.profiles.phone IS 'Contact phone number (Thai mobile format)';
COMMENT ON COLUMN public.profiles.line_id IS 'LINE Messenger ID for operational communications';
COMMENT ON COLUMN public.profiles.bank_name IS 'Bank name for payroll transfer';
COMMENT ON COLUMN public.profiles.bank_account IS 'Bank account number (format: 000-0-00000-0)';
COMMENT ON COLUMN public.profiles.enlistment_date IS 'Official employment start date';
COMMENT ON COLUMN public.profiles.clearance_date IS 'Contract end date or resignation date';
