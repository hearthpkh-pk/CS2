-- # 15_fix_personnel_id_and_trigger.sql
-- 🛠️ แก้ไขให้ Admin สามารถเพิ่มพนักงานได้โดยไม่ต้องมี Auth User ทันที

-- 1. ปลดข้อจำกัด Foreign Key เดิมที่บังคับว่าต้องมีใน auth.users ทันที
-- (เพื่อให้เราสร้าง Profile พนักงานทิ้งไว้ก่อนได้)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. ตั้งค่าให้คอลัมน์ id สร้าง UUID ให้อัตโนมัติเมื่อมีการ Insert (ถ้าไม่ได้ส่งมา)
ALTER TABLE public.profiles 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. อัปเดต Trigger เพื่อรองรับกรณีที่ Admin สร้างพนักงานไว้แล้ว และพนักงานมาสมัครทีหลัง
-- เราจะทำการ "เชื่อมโยง (Link)" ข้อมูลเดิมเข้ากับ Auth ID ใหม่ผ่าน Email
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- ถ้ามี Profile ที่ Admin สร้างไว้แล้ว (เช็คจาก Email) ให้ทำการ Link ID
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = new.email) THEN
        UPDATE public.profiles 
        SET id = new.id, 
            updated_at = NOW()
        WHERE email = new.email;
    ELSE
        -- ถ้าไม่มี ให้สร้าง Profile ใหม่ตามปกติ
        INSERT INTO public.profiles (id, name, username, role, email, is_active)
        VALUES (
            new.id, 
            COALESCE(new.raw_user_meta_data->>'name', 'New Staff'), 
            COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
            COALESCE(new.raw_user_meta_data->>'role', 'Staff'),
            new.email,
            false
        );
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
