-- Migration: Add sort_order to profiles for manual Kanban-style ordering
-- Description: Adds a sort_order integer column to the profiles table to persist user-defined ordering.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 999;

-- Update existing profiles with a sequential sort order (optional, but good for initialization)
WITH numbered_profiles AS (
  SELECT id, row_number() over (order by name) as rn
  FROM public.profiles
)
UPDATE public.profiles
SET sort_order = numbered_profiles.rn
FROM numbered_profiles
WHERE public.profiles.id = numbered_profiles.id;
