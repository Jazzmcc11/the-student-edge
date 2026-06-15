
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ SCHOLARSHIPS (public browseable) ============
CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text,
  description text,
  amount numeric(10,2),
  deadline date,
  category text,
  eligibility text,
  apply_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scholarships TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scholarships TO authenticated;
GRANT ALL ON public.scholarships TO service_role;

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view scholarships" ON public.scholarships
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert scholarships" ON public.scholarships
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update scholarships" ON public.scholarships
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete scholarships" ON public.scholarships
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER scholarships_updated_at BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX scholarships_deadline_idx ON public.scholarships(deadline);
CREATE INDEX scholarships_category_idx ON public.scholarships(category);

-- ============ COLLEGE APPLICATIONS (personal) ============
CREATE TABLE public.college_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_name text NOT NULL,
  submitted boolean NOT NULL DEFAULT false,
  accepted boolean,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.college_applications TO authenticated;
GRANT ALL ON public.college_applications TO service_role;

ALTER TABLE public.college_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own college apps" ON public.college_applications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER college_apps_updated_at BEFORE UPDATE ON public.college_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SCHOLARSHIP APPLICATIONS (personal) ============
CREATE TABLE public.scholarship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid REFERENCES public.scholarships(id) ON DELETE SET NULL,
  name text NOT NULL,
  date_applied date,
  received boolean NOT NULL DEFAULT false,
  amount numeric(10,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarship_applications TO authenticated;
GRANT ALL ON public.scholarship_applications TO service_role;

ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scholarship apps" ON public.scholarship_applications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER scholarship_apps_updated_at BEFORE UPDATE ON public.scholarship_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
