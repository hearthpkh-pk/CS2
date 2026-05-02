-- # 24_bulletproof_cascading_fks.sql
-- 🛠️ ปรับปรุง Foreign Keys ให้รองรับ ON UPDATE CASCADE
-- เพื่อให้การ Relink Profile UUID ใน DB Trigger ทำงานได้โดยไม่ติด Constraints

DO $$
BEGIN
    -- 1. facebook_pages
    ALTER TABLE public.facebook_pages DROP CONSTRAINT IF EXISTS facebook_pages_owner_id_fkey;
    ALTER TABLE public.facebook_pages ADD CONSTRAINT facebook_pages_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE;

    -- 2. daily_logs
    ALTER TABLE public.daily_logs DROP CONSTRAINT IF EXISTS daily_logs_staff_id_fkey;
    ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON UPDATE CASCADE;

    -- 3. facebook_accounts
    ALTER TABLE public.facebook_accounts DROP CONSTRAINT IF EXISTS facebook_accounts_owner_id_fkey;
    ALTER TABLE public.facebook_accounts ADD CONSTRAINT facebook_accounts_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;

    -- 4. salary_adjustments
    ALTER TABLE public.salary_adjustments DROP CONSTRAINT IF EXISTS salary_adjustments_staff_id_fkey;
    ALTER TABLE public.salary_adjustments ADD CONSTRAINT salary_adjustments_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;

    -- 5. leave_requests
    ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_staff_id_fkey;
    ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;

    -- 6. monthly_submissions
    ALTER TABLE public.monthly_submissions DROP CONSTRAINT IF EXISTS monthly_submissions_staff_id_fkey;
    ALTER TABLE public.monthly_submissions ADD CONSTRAINT monthly_submissions_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON UPDATE CASCADE;
    
    ALTER TABLE public.monthly_submissions DROP CONSTRAINT IF EXISTS monthly_submissions_reviewed_by_fkey;
    ALTER TABLE public.monthly_submissions ADD CONSTRAINT monthly_submissions_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON UPDATE CASCADE;

END $$;
