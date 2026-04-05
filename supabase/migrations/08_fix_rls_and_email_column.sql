-- # 08_fix_rls_and_email_column.sql
-- 🚨 HOTFIX: แก้บั๊ก 2 จุดจาก Runtime Error Log
-- 1. profiles.email column ไม่มี → เพิ่มเข้าไป
-- 2. teams table ไม่มี RLS Policy สำหรับ Admin Insert → เพิ่ม Policy

-- ============================================================
-- FIX 1: เพิ่ม email column ใน profiles
-- ============================================================
-- หมายเหตุสถาปัตยกรรม: Supabase เก็บ Email จริงไว้ใน auth.users
-- เราเก็บ copy ไว้ใน profiles เพื่อ Query ง่ายโดยไม่ต้อง JOIN ข้าม Schema
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill: ดึง email จาก auth.users มาใส่ profiles ให้พนักงานที่มีอยู่แล้ว
UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
    AND p.email IS NULL;

COMMENT ON COLUMN public.profiles.email IS 'Mirror of auth.users.email for operational queries without schema cross-join';

-- ============================================================
-- FIX 2: RLS Policies สำหรับตาราง teams
-- ============================================================
-- เหตุผล: teams table เปิด RLS แต่ไม่มี Policy → ทุก operation โดน DENY

-- เปิดใช้งาน RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Policy 1: ทุกคนที่ล็อกอินแล้วสามารถดูทีมได้
CREATE POLICY "teams_select_authenticated"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: เฉพาะ Admin และ Super Admin เท่านั้นที่สร้างทีมได้
CREATE POLICY "teams_insert_admin_only"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('Admin', 'Super Admin', 'Developer')
  );

-- Policy 3: เฉพาะ Admin และ Super Admin เท่านั้นที่แก้ไขทีมได้
CREATE POLICY "teams_update_admin_only"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('Admin', 'Super Admin', 'Developer')
  );

-- Policy 4: เฉพาะ Super Admin เท่านั้นที่ลบทีมได้
CREATE POLICY "teams_delete_superadmin_only"
  ON public.teams FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('Super Admin', 'Developer')
  );
