-- Athlete flag on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_athlete boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS athlete_prompt_dismissed boolean NOT NULL DEFAULT false;

-- Athlete profile (sport-specific info)
CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_sport text,
  position text,
  division_target text, -- 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO' | 'Undecided'
  graduation_year int,
  height text,
  weight text,
  gpa_core numeric(3,2),
  sat_score int,
  act_score int,
  ncaa_id text,
  ncaa_registered boolean NOT NULL DEFAULT false,
  amateurism_certified boolean NOT NULL DEFAULT false,
  transcripts_sent boolean NOT NULL DEFAULT false,
  test_scores_sent boolean NOT NULL DEFAULT false,
  highlight_reel_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_profiles TO authenticated;
GRANT ALL ON public.athlete_profiles TO service_role;
ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own athlete profile" ON public.athlete_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "linked parent read athlete" ON public.athlete_profiles
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));
CREATE TRIGGER trg_athlete_profiles_updated
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NCAA core courses tracker (16 required)
CREATE TABLE public.ncaa_core_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'english' | 'math' | 'science' | 'social_science' | 'additional'
  course_name text NOT NULL,
  year_taken text, -- '9' | '10' | '11' | '12'
  grade text,
  credits numeric(3,2) DEFAULT 1.0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ncaa_core_courses TO authenticated;
GRANT ALL ON public.ncaa_core_courses TO service_role;
ALTER TABLE public.ncaa_core_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ncaa courses" ON public.ncaa_core_courses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "linked parent read ncaa courses" ON public.ncaa_core_courses
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));
CREATE TRIGGER trg_ncaa_core_courses_updated
  BEFORE UPDATE ON public.ncaa_core_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recruiting contacts (coaches, camps, visits)
CREATE TABLE public.recruiting_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name text NOT NULL,
  coach_name text,
  coach_email text,
  coach_phone text,
  division text,
  status text NOT NULL DEFAULT 'interested', -- interested | contacted | responded | visiting | offer | committed | passed
  last_contact_at date,
  next_step text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruiting_contacts TO authenticated;
GRANT ALL ON public.recruiting_contacts TO service_role;
ALTER TABLE public.recruiting_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recruiting contacts" ON public.recruiting_contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "linked parent read recruiting" ON public.recruiting_contacts
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));
CREATE TRIGGER trg_recruiting_contacts_updated
  BEFORE UPDATE ON public.recruiting_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();