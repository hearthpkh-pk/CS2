-- # 00_auth_schema.sql
-- 🛠️ ตารางบริหารจัดการข้อมูลพนักงาน (เชื่อมโยงกับ auth.users ของ Supabase)

-- 1. สร้างตาราง Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'Staff',
    team_id UUID,
    salary DECIMAL(15, 2) DEFAULT 0,
    department TEXT,
    "group" TEXT,
    is_active BOOLEAN DEFAULT false, -- 🛡️ ป้องกันพนักงานเข้าถึงข้อมูลจนกว่า Admin จะอนุมัติ (Bulletproof Security)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ฟังก์ชันสำหรับสร้าง Profile อัตโนมัติ (Trigger Function)
-- ทุกครั้งที่มีการ Sign up ในระบบ Auth, ฟังก์ชันนี้จะถูกเรียกมาสร้าง Profile ให้อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, username, role, is_active)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'name', 'New Staff'), 
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'Staff'),
        false -- บังคับให้เป็น false เสมอเมื่อสมัครใหม่
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ตรวจสอบและสร้าง Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 🛡️ นโยบาย: พนักงานเห็นเฉพาะ Profile ของตัวเอง (หลีกเลี่ยง Infinite Recursion)
CREATE POLICY "Users can see own profile" ON public.profiles
FOR SELECT TO authenticated
USING ( id = auth.uid() );
