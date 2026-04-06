-- # 09_facebook_accounts_schema.sql
-- 🛠️ ตารางจัดเก็บข้อมูลบัญชี Facebook (FB Accounts) ที่ใช้สำหรับจัดการเพจ

CREATE TABLE IF NOT EXISTS public.facebook_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id INTEGER,
    name TEXT NOT NULL,
    uid TEXT,
    status TEXT DEFAULT 'Live',
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    password TEXT,
    two_factor TEXT,
    email TEXT,
    email_password TEXT,
    email2 TEXT,
    profile_url TEXT,
    cookie TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.facebook_accounts ENABLE ROW LEVEL SECURITY;

-- 🛡️ นโยบายการเข้าถึงข้อมูล (ใครเห็นอะไรได้บ้าง)
-- 1. ดูข้อมูลได้เฉพาะบัญชีที่เป็นของตนเอง หรือถ้าเป็น Admin/SuperAdmin/Developer สามารถดูได้ทั้งหมด
CREATE POLICY "Users can view own or all if admin" ON public.facebook_accounts
    FOR SELECT TO authenticated
    USING (
        owner_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'SuperAdmin', 'Super Admin', 'Developer')
    );

-- 2. เพิ่มข้อมูลได้ (ผูกกับ owner_id)
CREATE POLICY "Users can insert" ON public.facebook_accounts
    FOR INSERT TO authenticated
    WITH CHECK (
        -- อนุญาตให้เพิ่มบัญชีตัวเอง หรือถ้าเป็น Admin/SuperAdmin/Developer อนุญาตให้เพิ่มให้คนอื่นได้
        owner_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'SuperAdmin', 'Super Admin', 'Developer')
    );

-- 3. อัปเดตข้อมูลได้ (ต้องเป็นเจ้าของ หรือ Admin/SuperAdmin/Developer)
CREATE POLICY "Users can update own or all if admin" ON public.facebook_accounts
    FOR UPDATE TO authenticated
    USING (
        owner_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'SuperAdmin', 'Super Admin', 'Developer')
    );

-- 4. ลบข้อมูลถาวรได้เฉพาะ Admin ขึ้นไปเท่านั้น พนักงานทั่วไปใช้แค่ Soft Delete (is_deleted = true)
CREATE POLICY "Only admins can delete" ON public.facebook_accounts
    FOR DELETE TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'SuperAdmin', 'Super Admin', 'Developer')
    );
