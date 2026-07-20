
CREATE TABLE public.parent_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL,
  author_child_grade TEXT,
  title TEXT NOT NULL,
  blurb TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'senior-year',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  moderation_note TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_articles TO authenticated;
GRANT ALL ON public.parent_articles TO service_role;

ALTER TABLE public.parent_articles ENABLE ROW LEVEL SECURITY;

-- Authors: read & update their own (any status)
CREATE POLICY "Authors read own parent articles"
  ON public.parent_articles FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors update own pending parent articles"
  ON public.parent_articles FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND status = 'pending')
  WITH CHECK (auth.uid() = author_id AND status = 'pending');

-- Parents may read approved articles
CREATE POLICY "Parents read approved articles"
  ON public.parent_articles FOR SELECT TO authenticated
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'parent'
    )
  );

-- Parents may submit new (pending) articles authored by themselves
CREATE POLICY "Parents submit articles"
  ON public.parent_articles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'parent'
    )
  );

-- Admin full access
CREATE POLICY "Admins read all parent articles"
  ON public.parent_articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update parent articles"
  ON public.parent_articles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete parent articles"
  ON public.parent_articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_parent_articles_updated_at
  BEFORE UPDATE ON public.parent_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_parent_articles_status_created ON public.parent_articles (status, created_at DESC);
CREATE INDEX idx_parent_articles_author ON public.parent_articles (author_id, created_at DESC);
