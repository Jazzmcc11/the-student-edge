
-- ESSAYS
CREATE TABLE public.essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id uuid REFERENCES public.college_applications(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled draft',
  prompt text,
  prompt_type text NOT NULL DEFAULT 'personal_statement',
  draft_content text NOT NULL DEFAULT '',
  word_limit int,
  status text NOT NULL DEFAULT 'brainstorming',
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.essays TO authenticated;
GRANT ALL ON public.essays TO service_role;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own essays" ON public.essays FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER essays_updated BEFORE UPDATE ON public.essays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RECOMMENDERS
CREATE TABLE public.recommenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  email text,
  relationship text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommenders TO authenticated;
GRANT ALL ON public.recommenders TO service_role;
ALTER TABLE public.recommenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recommenders" ON public.recommenders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER recommenders_updated BEFORE UPDATE ON public.recommenders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RECOMMENDATION REQUESTS
CREATE TABLE public.recommendation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommender_id uuid NOT NULL REFERENCES public.recommenders(id) ON DELETE CASCADE,
  college_id uuid REFERENCES public.college_applications(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_asked',
  requested_at timestamptz,
  confirmed_at timestamptz,
  submitted_at timestamptz,
  thank_you_sent boolean NOT NULL DEFAULT false,
  deadline date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_requests TO authenticated;
GRANT ALL ON public.recommendation_requests TO service_role;
ALTER TABLE public.recommendation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rec requests" ON public.recommendation_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER rec_requests_updated BEFORE UPDATE ON public.recommendation_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FINAID TASKS
CREATE TABLE public.finaid_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  category text NOT NULL DEFAULT 'fafsa',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finaid_tasks TO authenticated;
GRANT ALL ON public.finaid_tasks TO service_role;
ALTER TABLE public.finaid_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own finaid" ON public.finaid_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER finaid_updated BEFORE UPDATE ON public.finaid_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AID AWARDS
CREATE TABLE public.aid_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id uuid REFERENCES public.college_applications(id) ON DELETE SET NULL,
  college_name text NOT NULL,
  cost_of_attendance numeric,
  grants numeric NOT NULL DEFAULT 0,
  scholarships_amt numeric NOT NULL DEFAULT 0,
  loans numeric NOT NULL DEFAULT 0,
  work_study numeric NOT NULL DEFAULT 0,
  family_contribution numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aid_awards TO authenticated;
GRANT ALL ON public.aid_awards TO service_role;
ALTER TABLE public.aid_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own awards" ON public.aid_awards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER aid_awards_updated BEFORE UPDATE ON public.aid_awards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TUTOR THREADS
CREATE TABLE public.tutor_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT 'general',
  title text NOT NULL DEFAULT 'New chat',
  level text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_threads TO authenticated;
GRANT ALL ON public.tutor_threads TO service_role;
ALTER TABLE public.tutor_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tutor threads" ON public.tutor_threads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tutor_threads_updated BEFORE UPDATE ON public.tutor_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TUTOR MESSAGES
CREATE TABLE public.tutor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.tutor_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_messages TO authenticated;
GRANT ALL ON public.tutor_messages TO service_role;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tutor messages" ON public.tutor_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TUTOR NOTES (pinned)
CREATE TABLE public.tutor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES public.tutor_threads(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  subject text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutor_notes TO authenticated;
GRANT ALL ON public.tutor_notes TO service_role;
ALTER TABLE public.tutor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tutor notes" ON public.tutor_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tutor_notes_updated BEFORE UPDATE ON public.tutor_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX essays_user_idx ON public.essays(user_id);
CREATE INDEX rec_req_user_idx ON public.recommendation_requests(user_id);
CREATE INDEX aid_user_idx ON public.aid_awards(user_id);
CREATE INDEX tutor_thread_user_idx ON public.tutor_threads(user_id);
CREATE INDEX tutor_msg_thread_idx ON public.tutor_messages(thread_id);
