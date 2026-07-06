ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gpa numeric(4,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gpa_scale text DEFAULT '4.0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_checklist jsonb DEFAULT '{}'::jsonb;