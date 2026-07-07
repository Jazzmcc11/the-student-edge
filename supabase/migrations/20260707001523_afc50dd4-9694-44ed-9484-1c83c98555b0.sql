
-- Fix SECURITY DEFINER view lint: replace wins_public view with a
-- SECURITY DEFINER SQL function that returns redacted rows.
DROP VIEW IF EXISTS public.wins_public;

CREATE OR REPLACE FUNCTION public.get_wins_feed()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  scholarship_name text,
  amount numeric,
  anonymous boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.id,
    CASE WHEN w.anonymous THEN NULL ELSE w.user_id END,
    CASE WHEN w.anonymous THEN 'Anonymous' ELSE w.display_name END,
    w.scholarship_name,
    w.amount,
    w.anonymous,
    w.created_at
  FROM public.wins w
  ORDER BY w.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_wins_feed() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_wins_feed() TO authenticated;

-- Lock internal helpers so signed-in users cannot invoke them directly.
-- They only need to run inside RLS/other SECURITY DEFINER functions,
-- which use the function owner's privileges.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE ALL ON FUNCTION public.is_linked_parent(uuid, uuid) FROM authenticated;
