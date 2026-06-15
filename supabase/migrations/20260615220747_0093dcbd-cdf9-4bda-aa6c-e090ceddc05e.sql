
-- Invites
CREATE TABLE public.parent_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_invites TO authenticated;
GRANT ALL ON public.parent_invites TO service_role;
ALTER TABLE public.parent_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own invites" ON public.parent_invites
  FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Links
CREATE TABLE public.parent_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_student_links TO authenticated;
GRANT ALL ON public.parent_student_links TO service_role;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view own links" ON public.parent_student_links
  FOR SELECT TO authenticated
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

CREATE POLICY "Parties can delete own links" ON public.parent_student_links
  FOR DELETE TO authenticated
  USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Helper to check parent->student link
CREATE OR REPLACE FUNCTION public.is_linked_parent(_parent uuid, _student uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_student_links
    WHERE parent_id = _parent AND student_id = _student
  )
$$;

-- Allow linked parents to view student app data (read-only)
CREATE POLICY "Linked parents can view college apps" ON public.college_applications
  FOR SELECT TO authenticated
  USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view scholarship apps" ON public.scholarship_applications
  FOR SELECT TO authenticated
  USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view student profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_linked_parent(auth.uid(), id));

-- Redeem invite (atomic): validates, creates link, marks invite used
CREATE OR REPLACE FUNCTION public.redeem_parent_invite(_code text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_invite public.parent_invites%ROWTYPE;
  v_link_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invite FROM public.parent_invites
    WHERE code = upper(_code) FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid code'; END IF;
  IF v_invite.used_at IS NOT NULL THEN RAISE EXCEPTION 'Code already used'; END IF;
  IF v_invite.expires_at < now() THEN RAISE EXCEPTION 'Code expired'; END IF;
  IF v_invite.student_id = auth.uid() THEN RAISE EXCEPTION 'Cannot link to yourself'; END IF;

  INSERT INTO public.parent_student_links (parent_id, student_id)
    VALUES (auth.uid(), v_invite.student_id)
    ON CONFLICT (parent_id, student_id) DO UPDATE SET created_at = parent_student_links.created_at
    RETURNING id INTO v_link_id;

  UPDATE public.parent_invites
    SET used_at = now(), used_by = auth.uid()
    WHERE id = v_invite.id;

  RETURN v_link_id;
END;
$$;
