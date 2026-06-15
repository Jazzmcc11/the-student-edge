-- ============ WINS ============
CREATE TABLE public.wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_name text NOT NULL,
  amount numeric,
  note text,
  anonymous boolean NOT NULL DEFAULT false,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wins TO authenticated;
GRANT ALL ON public.wins TO service_role;
ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wins_read_all_authed" ON public.wins FOR SELECT TO authenticated USING (true);
CREATE POLICY "wins_insert_own" ON public.wins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wins_update_own" ON public.wins FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wins_delete_own" ON public.wins FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============ BUDDY PROFILES ============
CREATE TABLE public.buddy_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  grade_level text,
  bio text,
  colleges text,
  scholarships text,
  contact text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buddy_profiles TO authenticated;
GRANT ALL ON public.buddy_profiles TO service_role;
ALTER TABLE public.buddy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buddy_read_visible" ON public.buddy_profiles FOR SELECT TO authenticated USING (visible = true OR auth.uid() = user_id);
CREATE POLICY "buddy_insert_own" ON public.buddy_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "buddy_update_own" ON public.buddy_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "buddy_delete_own" ON public.buddy_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_buddy_updated BEFORE UPDATE ON public.buddy_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ADVICE POSTS ============
CREATE TYPE public.advice_audience AS ENUM ('student', 'parent', 'both');
CREATE TABLE public.advice_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  audience public.advice_audience NOT NULL DEFAULT 'both',
  category text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advice_posts TO authenticated;
GRANT ALL ON public.advice_posts TO service_role;
ALTER TABLE public.advice_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advice_read_published" ON public.advice_posts FOR SELECT TO authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "advice_admin_insert" ON public.advice_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "advice_admin_update" ON public.advice_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "advice_admin_delete" ON public.advice_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_advice_updated BEFORE UPDATE ON public.advice_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DISCUSSION ============
CREATE TABLE public.discussion_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  audience public.advice_audience NOT NULL DEFAULT 'both',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_topics TO authenticated;
GRANT ALL ON public.discussion_topics TO service_role;
ALTER TABLE public.discussion_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_read_all" ON public.discussion_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "topics_admin_write" ON public.discussion_topics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.discussion_topics(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_threads TO authenticated;
GRANT ALL ON public.discussion_threads TO service_role;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads_read_all" ON public.discussion_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "threads_insert_own" ON public.discussion_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "threads_update_own" ON public.discussion_threads FOR UPDATE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "threads_delete_own" ON public.discussion_threads FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON public.discussion_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_threads_topic ON public.discussion_threads(topic_id, created_at DESC);

CREATE TABLE public.discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_replies TO authenticated;
GRANT ALL ON public.discussion_replies TO service_role;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "replies_read_all" ON public.discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "replies_insert_own" ON public.discussion_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "replies_update_own" ON public.discussion_replies FOR UPDATE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "replies_delete_own" ON public.discussion_replies FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_replies_thread ON public.discussion_replies(thread_id, created_at ASC);

-- Seed default topics
INSERT INTO public.discussion_topics (slug, name, description, audience, sort_order) VALUES
  ('essays', 'Essays & Personal Statements', 'Workshop ideas, share drafts, ask for feedback.', 'student', 1),
  ('financial-aid', 'Financial Aid & FAFSA', 'CSS Profile, appeals, award letters, EFC questions.', 'both', 2),
  ('test-prep', 'SAT / ACT Prep', 'Strategies, free resources, study schedules.', 'student', 3),
  ('decisions', 'Admissions Decisions', 'Where you got in, where you''re leaning, how you decided.', 'student', 4),
  ('parent-corner', 'Parent Corner', 'For parents only — supporting your student without taking over.', 'parent', 5),
  ('hbcu', 'HBCUs', 'Everything HBCU — recruiting, visits, scholarships.', 'both', 6),
  ('general', 'General', 'Anything else college, scholarship, or future-related.', 'both', 99);