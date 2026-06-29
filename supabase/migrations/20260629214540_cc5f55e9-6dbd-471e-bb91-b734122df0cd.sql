
-- Add state to profiles (skip if already exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Key dates table
CREATE TABLE public.key_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('fafsa','scholarship','college','test','financial_aid')),
  date DATE NOT NULL,
  state TEXT,
  url TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.key_dates TO authenticated;
GRANT ALL ON public.key_dates TO service_role;

ALTER TABLE public.key_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read key dates"
  ON public.key_dates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage key dates"
  ON public.key_dates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_key_dates_updated_at
  BEFORE UPDATE ON public.key_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_key_dates_date ON public.key_dates(date);
CREATE INDEX idx_key_dates_state ON public.key_dates(state);
CREATE INDEX idx_key_dates_category ON public.key_dates(category);
