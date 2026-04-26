-- Migration: Add page-level review status

ALTER TABLE submission_pages
ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) DEFAULT 'Pending'
  CHECK (review_status IN ('Pending', 'Approved', 'Rejected')),
ADD COLUMN IF NOT EXISTS review_note TEXT;
