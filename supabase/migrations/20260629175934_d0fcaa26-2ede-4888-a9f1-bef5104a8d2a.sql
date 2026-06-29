
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS grade_level int CHECK (grade_level BETWEEN 9 AND 12),
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS theme_mode text DEFAULT 'dark' CHECK (theme_mode IN ('light','dark','system')),
  ADD COLUMN IF NOT EXISTS accent text DEFAULT 'gold' CHECK (accent IN ('gold','burnt','maroon','navy')),
  ADD COLUMN IF NOT EXISTS playlist_pref text DEFAULT 'hbcu',
  ADD COLUMN IF NOT EXISTS last_visited_module text,
  ADD COLUMN IF NOT EXISTS last_visited_at timestamptz;

-- 2. user_goals
CREATE TABLE IF NOT EXISTS public.user_goals (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_colleges text[] NOT NULL DEFAULT '{}',
  intended_majors text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  career_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_goals TO authenticated;
GRANT ALL ON public.user_goals TO service_role;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.user_goals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_goals_updated BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. activity_pings (one row per user per day)
CREATE TABLE IF NOT EXISTS public.activity_pings (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  PRIMARY KEY (user_id, day)
);
GRANT SELECT, INSERT ON public.activity_pings TO authenticated;
GRANT ALL ON public.activity_pings TO service_role;
ALTER TABLE public.activity_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pings read" ON public.activity_pings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "own pings insert" ON public.activity_pings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. personality_results
CREATE TABLE IF NOT EXISTS public.personality_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype text NOT NULL,
  axes jsonb NOT NULL,
  answers jsonb NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS personality_results_user_idx ON public.personality_results(user_id, taken_at DESC);
GRANT SELECT, INSERT, DELETE ON public.personality_results TO authenticated;
GRANT ALL ON public.personality_results TO service_role;
ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own results" ON public.personality_results FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. avatars storage bucket policies (bucket created via tool separately)
-- Policies on storage.objects scoped to user folder
DO $$ BEGIN
  CREATE POLICY "avatars public read" ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars own write" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars own update" ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "avatars own delete" ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
