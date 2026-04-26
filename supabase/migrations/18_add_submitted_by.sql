-- Migration: Add submitted_by_name for "Submit on behalf" feature

ALTER TABLE monthly_submissions
ADD COLUMN IF NOT EXISTS submitted_by_name VARCHAR(255);
