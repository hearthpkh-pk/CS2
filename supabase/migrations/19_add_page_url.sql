-- Migration: Add page_url to submission_pages for easy access during review

ALTER TABLE submission_pages
ADD COLUMN IF NOT EXISTS page_url TEXT;
