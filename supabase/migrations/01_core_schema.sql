-- # 01_core_schema.sql
-- 🛠️ ตารางเก็บข้อมูลหลัก (เพจการทำงาน และ สถิติรายวัน)

-- 1. ENUMS (จำกัดประเภทข้อมูลกันการพิมพ์ผิด)
CREATE TYPE page_status AS ENUM ('Active', 'Rest', 'Error', 'Problem');
CREATE TYPE log_source AS ENUM ('API', 'CSV', 'Manual');

-- 2. TABLES

-- ตารางสิทธิ์ทีม
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางบริหารจัดการเพจ
CREATE TABLE IF NOT EXISTS public.facebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    status page_status DEFAULT 'Active',
    box_id INTEGER CHECK (box_id >= 1 AND box_id <= 20),
    owner_id UUID REFERENCES public.profiles(id),  -- พนักงานผู้ดูแล
    team_id UUID REFERENCES public.teams(id),
    facebook_url TEXT,
    facebook_data JSONB, -- เก็บ Meta Data เช่น ยอดผู้ติดตามรวม
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางส่งงาน/จัดเก็บสถิติรายวัน
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.facebook_pages(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id),
    date DATE NOT NULL,
    followers INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    source log_source DEFAULT 'Manual',
    clips_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 🚨 กฎกันกระสุน: บังคับว่า 1 เพจ จะส่งงานได้แค่วันละ 1 ครั้งหลัก (ห้ามส่งซ้ำ)
    UNIQUE(page_id, date)
);

-- 3. เปิดใช้งาน RLS 
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- 🛡️ นโยบายการมองเห็นข้อมูล (พนักงานเห็นเฉพาะของตัวเอง / แอดมินเห็นทั้งหมด)
CREATE POLICY "Access pages policy" ON public.facebook_pages
FOR ALL TO authenticated
USING ( 
  owner_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

CREATE POLICY "Access daily logs policy" ON public.daily_logs
FOR ALL TO authenticated
USING ( 
  staff_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);
