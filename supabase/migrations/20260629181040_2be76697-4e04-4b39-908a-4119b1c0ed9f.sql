-- Seed parent-only topics using existing advice_audience enum ('parent')
INSERT INTO public.discussion_topics (slug, name, description, audience, sort_order)
VALUES
  ('paying-for-college', 'Paying for College', 'FAFSA, CSS Profile, scholarships, loans, and the real cost of attendance.', 'parent', 100),
  ('senior-year-logistics', 'Senior Year Logistics', 'Deadlines, deposits, dorm shopping, signing day — keep it organized.', 'parent', 101),
  ('parent-lounge', 'Parent Lounge', 'Vent, celebrate, and swap notes with other parents.', 'parent', 102),
  ('hbcu-vs-pwi', 'HBCU vs PWI Conversations', 'Helping your student weigh fit, culture, and outcomes.', 'parent', 103),
  ('mental-health-check-ins', 'Mental Health Check-ins', 'Supporting your student (and yourself) through a big year.', 'parent', 104)
ON CONFLICT (slug) DO UPDATE SET audience = EXCLUDED.audience;

CREATE TABLE IF NOT EXISTS public.nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (length(message) BETWEEN 1 AND 500),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nudges TO authenticated;
GRANT ALL ON public.nudges TO service_role;

ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents send nudges to linked students"
  ON public.nudges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = parent_id AND public.is_linked_parent(auth.uid(), student_id));

CREATE POLICY "Parent or student can view their nudges"
  ON public.nudges FOR SELECT TO authenticated
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Student can mark nudges read"
  ON public.nudges FOR UPDATE TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Parent can delete their nudges"
  ON public.nudges FOR DELETE TO authenticated
  USING (auth.uid() = parent_id);

CREATE INDEX IF NOT EXISTS nudges_student_idx ON public.nudges(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS nudges_parent_idx ON public.nudges(parent_id, created_at DESC);
