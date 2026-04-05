# Supabase Database Schema Draft (Proposed)

ด้านล่างนี้คือร่างโครงสร้าง SQL สำหรับการสร้าง Database ใน Supabase เพื่อรองรับระบบ CS2:

```sql
-- 1. ENUMS (ป้องกันการสะกดผิดและล็อกค่าตาม Typescript)
CREATE TYPE user_role AS ENUM ('Staff', 'Manager', 'Admin', 'Super Admin', 'Developer');
CREATE TYPE page_status AS ENUM ('Active', 'Rest', 'Error', 'Problem');
CREATE TYPE log_source AS ENUM ('API', 'CSV', 'Manual');

-- 2. TABLES
-- ขยายจาก auth.users ของ Supabase
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    role user_role DEFAULT 'Staff',
    team_id UUID,
    salary DECIMAL(15, 2) DEFAULT 0,
    department TEXT,
    "group" TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE facebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    status page_status DEFAULT 'Active',
    box_id INTEGER CHECK (box_id >= 1 AND box_id <= 20),
    owner_id UUID REFERENCES profiles(id),
    team_id UUID REFERENCES teams(id),
    facebook_url TEXT,
    facebook_data JSONB, -- สำหรับเก็บ followers, profilePic, description
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES facebook_pages(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES profiles(id),
    date DATE NOT NULL,
    followers INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    source log_source DEFAULT 'Manual',
    clips_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ห้ามส่ง Log ซ้ำวันเดิมในเพจเดิม (Data Integrity)
    UNIQUE(page_id, date)
);

-- 3. RLS POLICIES (ตัวอย่าง Logic การคัดกรองข้อมูล)

ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY;

-- Staff: เห็นเฉพาะเพจที่ตัวเองเป็นเจ้าของ
CREATE POLICY "Staff view own pages" ON facebook_pages
FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- Manager: เห็นทุกเพจในทีมตัวเอง
CREATE POLICY "Manager view team pages" ON facebook_pages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'Manager'
    AND profiles.team_id = facebook_pages.team_id
  )
);

-- Super Admin: เห็นทุกอย่าง
CREATE POLICY "SuperAdmin full access" ON facebook_pages
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'Super Admin'
  )
);
```

> [!TIP]
> การใช้ **UUID** แทน ID แบบสุ่มธรรมดา จะช่วยเพิ่มความปลอดภัยและความเข้ากันได้กับระบบ Auth ของ Supabase ได้ดีที่สุดครับ
