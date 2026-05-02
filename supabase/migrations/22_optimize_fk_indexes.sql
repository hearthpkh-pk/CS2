-- # 22_optimize_fk_indexes.sql
-- 🛠️ Optimization: เพิ่ม Index ให้กับตารางที่มี Foreign Key เพื่อเพิ่มความเร็วในการ JOIN และรัน Trigger
-- ป้องกันอาการ Database Lock และ Timeout ตอนที่ Trigger ทำงานหนัก (เช่น handle_new_user)

-- ตาราง daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_staff_id ON public.daily_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_page_id ON public.daily_logs(page_id);

-- ตาราง facebook_pages
CREATE INDEX IF NOT EXISTS idx_facebook_pages_owner_id ON public.facebook_pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_facebook_pages_team_id ON public.facebook_pages(team_id);

-- ตาราง facebook_accounts
CREATE INDEX IF NOT EXISTS idx_facebook_accounts_owner_id ON public.facebook_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_facebook_accounts_team_id ON public.facebook_accounts(team_id);

-- ตาราง leave_requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff_id ON public.leave_requests(staff_id);

-- ตาราง salary_adjustments
CREATE INDEX IF NOT EXISTS idx_salary_adjustments_staff_id ON public.salary_adjustments(staff_id);

-- ตาราง monthly_submissions (เพิ่มเติมสำหรับ reviewed_by)
CREATE INDEX IF NOT EXISTS idx_monthly_submissions_reviewed_by ON public.monthly_submissions(reviewed_by);

-- ข้อควรระวัง: index พวกนี้จะช่วยให้เวลา Trigger handle_new_user สั่ง UPDATE WHERE staff_id = ... 
-- เร็วขึ้นจาก O(N) Sequential Scan กลายเป็น O(log N) Index Scan ทำให้ปลดล็อค Row ทันที
