
CREATE TABLE public.writing_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.writing_entries TO authenticated;
GRANT ALL ON public.writing_entries TO service_role;
ALTER TABLE public.writing_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own writing entries" ON public.writing_entries FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_writing_entries_updated_at BEFORE UPDATE ON public.writing_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX writing_entries_user_created_idx ON public.writing_entries(user_id, created_at DESC);

CREATE TABLE public.practice_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  test TEXT NOT NULL,
  section TEXT NOT NULL,
  question_id TEXT NOT NULL,
  chosen TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_attempts TO authenticated;
GRANT ALL ON public.practice_attempts TO service_role;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own practice attempts" ON public.practice_attempts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX practice_attempts_user_test_idx ON public.practice_attempts(user_id, test, created_at DESC);
