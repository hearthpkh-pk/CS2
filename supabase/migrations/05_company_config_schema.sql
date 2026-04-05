-- # 05_company_config_schema.sql
-- 🛠️ ตารางเก็บตั้งค่ากฎบริษัท เรทเงินเดือน และวันหยุด (Company Policy & Configuration)

CREATE TABLE IF NOT EXISTS public.company_configs (
    id TEXT PRIMARY KEY DEFAULT 'core-config',
    brands JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    groups JSONB DEFAULT '[]'::jsonb,
    announcements JSONB DEFAULT '[]'::jsonb,
    holidays JSONB DEFAULT '[]'::jsonb,
    performance_policy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่มข้อมูลเริ่มต้น (Default Config) ลงไป 1 แถว ถ้าไม่มี
INSERT INTO public.company_configs (id, performance_policy)
VALUES (
  'core-config', 
  '{"minViewTarget":5000000,"penaltyAmount":2000,"bonusStep1":1000,"superBonusThreshold":100000000,"bonusStep2":1500,"requiredPagesPerDay":4,"clipsPerPageInLog":4}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- เปิดการใช้งาน RLS
ALTER TABLE public.company_configs ENABLE ROW LEVEL SECURITY;

-- 🛡️ นโยบาย: พนักงานทุกคนในระบบต้องสามารถดึงกฎไปดู และเอาเอาสถิติ/เปอร์เซ็นต์ไปคำนวณเงินเดือนในเครื่องตัวเองได้
CREATE POLICY "Anyone can view company configs" ON public.company_configs
FOR SELECT TO authenticated
USING (true);

-- 🛡️ นโยบาย: เฉพาะ Admin / Super Admin ที่สามารถเข้าไปกดเปลี่ยนกฎ หักเงิน หรือโบนัสได้
CREATE POLICY "Admins can update configs" ON public.company_configs
FOR UPDATE TO authenticated
USING (
  public.get_my_role() IN ('Admin', 'Super Admin')
);

CREATE POLICY "Admins can insert configs" ON public.company_configs
FOR INSERT TO authenticated
WITH CHECK (
  public.get_my_role() IN ('Admin', 'Super Admin')
);
