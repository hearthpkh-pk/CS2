-- # 04_fix_infinite_recursion.sql
-- 🛠️ แก้ปัญหา Infinite Recursion ตอนโหลดข้อมูลพนักงานบนหน้า Team Management

-- 1. สร้างฟังก์ชันที่วิ่งทะลุกำแพง Security (Security Definer) 
-- เพื่อไปแอบดู Role ของคนที่ล็อกอินอยู่โดยไม่เรียกใช้ RLS ของตารางตัวเองใหม่อีกรอบ
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  my_role text;
BEGIN
  SELECT role INTO my_role FROM profiles WHERE id = auth.uid();
  RETURN my_role;
END;
$$;

-- 2. ดรอป Policy เก่าที่ทำให้เกิด Infinite Loop
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- 3. เสียบ Policy ใหม่ที่ใช้ปืนยิงทะลุกำแพง (Function get_my_role) แทน
CREATE POLICY "Managers can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Super Admin', 'Manager')
);

CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Super Admin')
);
