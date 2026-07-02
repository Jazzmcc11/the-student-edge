
ALTER TABLE public.college_applications
  ADD COLUMN IF NOT EXISTS common_app_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supplements_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recs_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transcript_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scores_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deadline_type text,
  ADD COLUMN IF NOT EXISTS deadline_date date,
  ADD COLUMN IF NOT EXISTS essay_draft text;
