-- # 14_fix_profiles_rls.sql
-- 🛠️ แก้ไข RLS สำหรับตาราง profiles เพื่อให้ Admin สามารถจัดการข้อมูลได้

-- 1. ลบนโยบายเก่า (ถ้ามี) เพื่อป้องกันการซ้ำซ้อน
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone authenticated" ON public.profiles;

-- 2. นโยบายการเลือกดูข้อมูล (SELECT)
-- พนักงานทุกคนต้องเห็นโปรไฟล์คนอื่น (เพื่อดูชื่อ/ทีม) แต่เห็นข้อมูลจำกัด
-- ในที่นี้เราอนุญาตให้ Authenticated Users ดูได้ทั้งหมด (หรือจะจำกัด field ก็ได้ในระดับ API)
CREATE POLICY "Profiles are viewable by authenticated" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

-- 3. นโยบายการเพิ่มข้อมูล (INSERT)
-- อนุญาตให้เฉพาะ Admin และ Super Admin สามารถเพิ่ม Personnel ใหม่ได้
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
  );

-- 4. นโยบายการแก้ไขข้อมูล (UPDATE)
-- - พนักงานแก้ของตัวเองได้ (บาง field)
-- - Admin แก้ได้ทุกคน
CREATE POLICY "Admins and owners can update profiles" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
  )
  WITH CHECK (
    id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
  );

-- 5. นโยบายการลบข้อมูล (DELETE)
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  TO authenticated 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
  );
