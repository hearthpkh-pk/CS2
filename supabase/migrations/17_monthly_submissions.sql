-- Migration: Monthly Submission Workflow
-- ระบบส่งเช็คยอดประจำเดือน: Staff → Admin Review → Commission Calculation

-- ตาราง: monthly_submissions (1 record = 1 การส่งของพนักงาน 1 เดือน)
CREATE TABLE IF NOT EXISTS monthly_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL,             -- 'YYYY-MM' (e.g. '2026-04')
  status VARCHAR(20) DEFAULT 'Draft'      -- Draft → Submitted → Approved / Rejected
    CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  total_views BIGINT DEFAULT 0,           -- Snapshot: รวมยอดวิวทุกเพจที่ส่ง
  total_followers BIGINT DEFAULT 0,       -- Snapshot: รวมยอดผู้ติดตาม
  calculated_commission BIGINT DEFAULT 0, -- ค่าคอมที่คำนวณจาก policy (หน่วย: สตางค์)
  adjusted_commission BIGINT,             -- ค่าคอมที่ Admin แก้ไข (nullable = ใช้ค่า calculated)
  commission_note TEXT,                   -- หมายเหตุการปรับค่าคอม
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 🛡️ พนักงาน 1 คน มี submission ได้ 1 record ต่อเดือน
  -- ถ้าถูก Reject แล้วส่งใหม่ จะลบ record เก่าแล้วสร้างใหม่
  UNIQUE(staff_id, period)
);

-- ตาราง: submission_pages (เพจที่เลือกส่งในแต่ละ submission)
CREATE TABLE IF NOT EXISTS submission_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES monthly_submissions(id) ON DELETE CASCADE,
  page_id UUID NOT NULL,
  page_name VARCHAR(255) NOT NULL,         -- Snapshot ชื่อเพจ ณ ตอนส่ง
  page_status VARCHAR(20),                 -- Active / Rest ณ ตอนส่ง
  snapshot_views BIGINT DEFAULT 0,         -- ยอดวิวรวมของเดือนนั้น
  snapshot_followers BIGINT DEFAULT 0,     -- ยอดผู้ติดตามรวม
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_submissions_staff 
  ON monthly_submissions(staff_id, period);

CREATE INDEX IF NOT EXISTS idx_monthly_submissions_status 
  ON monthly_submissions(status, period);

CREATE INDEX IF NOT EXISTS idx_submission_pages_submission 
  ON submission_pages(submission_id);

-- RLS Policies
ALTER TABLE monthly_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_pages ENABLE ROW LEVEL SECURITY;

-- Staff: อ่าน/เขียนได้เฉพาะ submission ของตัวเอง
CREATE POLICY "Users can manage own submissions" ON monthly_submissions
  FOR ALL USING (auth.uid() = staff_id);

-- Admin/SuperAdmin: อ่าน/เขียนได้ทุก submission (สำหรับ review)
CREATE POLICY "Admins can manage all submissions" ON monthly_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Super Admin', 'Developer')
    )
  );

-- submission_pages: อ่าน/เขียนตาม parent submission
CREATE POLICY "Users can manage own submission pages" ON submission_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM monthly_submissions
      WHERE monthly_submissions.id = submission_pages.submission_id
      AND monthly_submissions.staff_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all submission pages" ON submission_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Super Admin', 'Developer')
    )
  );
