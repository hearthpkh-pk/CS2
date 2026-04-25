-- # 13_add_brand_to_profiles.sql
-- 🛠️ เพิ่ม Column สำหรับกำหนดว่าพนักงานดูแล Brand อะไร (Workload Allocation)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS brand TEXT;

COMMENT ON COLUMN public.profiles.brand IS 'Advertising brand assigned to this user';
