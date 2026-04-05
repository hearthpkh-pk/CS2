-- # 03_hr_management_schema.sql
-- 🛠️ ตารางบริหารสิทธิพนักงานขั้นสูงและประวัติเงินเดือน

-- 1. ตารางเก็บประวัติการปรับเงินเดือน
CREATE TABLE IF NOT EXISTS public.salary_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    new_salary DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิดใช้งาน RLS สำหรับประวัติเงินเดือน
ALTER TABLE public.salary_adjustments ENABLE ROW LEVEL SECURITY;

-- นโยบาย: เฉพาะ Super Admin, Admin, Manager ดึงไปดูเงินเดือนได้
CREATE POLICY "Managers can view salary history" ON public.salary_adjustments
FOR SELECT TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin', 'Manager')
);

-- นโยบาย: เฉพาะ Super Admin และ Admin ที่ปรับเปลี่ยน/เพิ่มประวัติเงินเดือนได้
CREATE POLICY "Admins can insert salary history" ON public.salary_adjustments
FOR INSERT TO authenticated
WITH CHECK ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);


-- 2. ปรับปรุงสิทธิ์การเข้าถึงตาราง Profiles (แก้ไขจากรอบก่อนที่ต่างคนต่างเห็นแต่ตัวเอง)

-- นโยบาย: Super Admin, Admin, Manager สามารถ "เห็น" Profile ของคนอื่นได้
CREATE POLICY "Managers can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin', 'Manager')
);

-- นโยบาย: Super Admin และ Admin สามารถ "แก้ไข" ข้อมูลพนักงาน (ย้ายทีม เปลี่ยนเงินเดือน เปลี่ยน Role) ได้
CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);
