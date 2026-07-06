
CREATE POLICY "Linked parents can view essays" ON public.essays
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view aid awards" ON public.aid_awards
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view finaid tasks" ON public.finaid_tasks
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view rec requests" ON public.recommendation_requests
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view recommenders" ON public.recommenders
  FOR SELECT USING (public.is_linked_parent(auth.uid(), user_id));

CREATE TABLE public.essay_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  essay_id UUID NOT NULL REFERENCES public.essays(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.essay_comments TO authenticated;
GRANT ALL ON public.essay_comments TO service_role;
ALTER TABLE public.essay_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Author or student can view comments" ON public.essay_comments
  FOR SELECT USING (auth.uid() = author_id OR auth.uid() = student_id);
CREATE POLICY "Linked parent can add comments" ON public.essay_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id AND public.is_linked_parent(auth.uid(), student_id));
CREATE POLICY "Author can update own comments" ON public.essay_comments
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Author or student can delete comments" ON public.essay_comments
  FOR DELETE USING (auth.uid() = author_id OR auth.uid() = student_id);

CREATE INDEX essay_comments_essay_idx ON public.essay_comments(essay_id, created_at DESC);

CREATE TABLE public.parent_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  due_date DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_tasks TO authenticated;
GRANT ALL ON public.parent_tasks TO service_role;
ALTER TABLE public.parent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents manage own tasks" ON public.parent_tasks
  FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

CREATE TRIGGER parent_tasks_updated_at
  BEFORE UPDATE ON public.parent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.parent_saved_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, article_slug)
);

GRANT SELECT, INSERT, DELETE ON public.parent_saved_articles TO authenticated;
GRANT ALL ON public.parent_saved_articles TO service_role;
ALTER TABLE public.parent_saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents manage own saved articles" ON public.parent_saved_articles
  FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
