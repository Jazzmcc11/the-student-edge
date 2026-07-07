
DROP FUNCTION IF EXISTS public.get_wins_feed();

CREATE OR REPLACE FUNCTION public.get_wins_feed()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  scholarship_name text,
  amount numeric,
  note text,
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
    w.note,
    w.anonymous,
    w.created_at
  FROM public.wins w
  ORDER BY w.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_wins_feed() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_wins_feed() TO authenticated;
