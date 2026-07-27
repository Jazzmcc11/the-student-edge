-- Fix the cascading "permission denied for function is_linked_parent" error.
-- The profiles SELECT policy calls is_linked_parent(), so authenticated users
-- must be able to EXECUTE it (SECURITY DEFINER already scopes what it can read).
GRANT EXECUTE ON FUNCTION public.is_linked_parent(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Add Texas priority financial aid deadline
INSERT INTO public.key_dates (title, description, category, date, state, url, source)
SELECT 'TX Priority Financial Aid Deadline',
       'Priority deadline for TASFA / most Texas public universities. File FAFSA/TASFA by this date for best aid consideration.',
       'financial_aid', '2026-01-15', 'TX',
       'https://www.collegeforalltexans.com/', 'The Plug'
WHERE NOT EXISTS (
  SELECT 1 FROM public.key_dates WHERE title = 'TX Priority Financial Aid Deadline' AND date = '2026-01-15'
);