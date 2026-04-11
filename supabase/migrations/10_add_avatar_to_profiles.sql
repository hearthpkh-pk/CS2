-- # 10_add_avatar_to_profiles.sql
-- 🛠️ เพิ่มคอลัมน์ avatar_url และอัปเดตระบบดึงรูปโปรไฟล์อัตโนมัติ

-- 1. เพิ่มคอลัมน์ avatar_url สำหรับเก็บลิงก์รูปถ้ายังไม่มี
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. อัปเดตฟังก์ชัน handle_new_user() ให้ดึงรูปภาพจาก Google Profile (ถ้ามี)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, username, role, is_active, avatar_url)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'name', 'New Staff'), 
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'Staff'),
        false, -- บังคับให้เป็น false เสมอเมื่อสมัครใหม่ (รอพรูพ)
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture') -- ดึงรูปจาก Google Meta
    )
    ON CONFLICT (id) DO UPDATE SET
        avatar_url = EXCLUDED.avatar_url; -- เผื่อกรณี Re-login แล้วรูปเปลี่ยน
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
