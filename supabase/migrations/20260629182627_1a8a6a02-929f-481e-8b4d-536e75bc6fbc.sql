ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_relationship text,
  ADD COLUMN IF NOT EXISTS parent_household_students int,
  ADD COLUMN IF NOT EXISTS parent_focus text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS parent_style text,
  ADD COLUMN IF NOT EXISTS parent_update_freq text;