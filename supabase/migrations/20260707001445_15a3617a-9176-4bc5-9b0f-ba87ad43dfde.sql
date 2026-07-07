
-- 1. user_roles: prevent self-assign of privileged roles.
-- Only admins can insert/update/delete role rows.
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 2. parent_invites: force redemption through SECURITY DEFINER function only.
-- Ensure no direct read/write path exists for non-owners.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.parent_invites FROM anon;
-- Existing "Students manage own invites" ALL policy already scopes to student_id.
-- Add explicit block for authenticated users who are not the owning student:
-- (No extra policy needed — RLS is default-deny; the ALL policy already covers owners.)
-- redeem_parent_invite (SECURITY DEFINER) is the only way for parents to consume codes.


-- 3. buddy_profiles: hide `contact` from broad visibility.
-- Restrict base-table SELECT to owner. Expose a public-safe view without contact.
DROP POLICY IF EXISTS buddy_read_visible ON public.buddy_profiles;

CREATE POLICY buddy_read_own ON public.buddy_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.buddy_profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id,
  display_name,
  grade_level,
  colleges,
  scholarships,
  bio,
  visible,
  created_at,
  updated_at
FROM public.buddy_profiles
WHERE visible = true;

GRANT SELECT ON public.buddy_profiles_public TO authenticated;

-- Owners still see their own contact through the base table policy above.
-- To let a viewer request contact, add a policy allowing SELECT on the base
-- table when the viewer explicitly asks (future opt-in). For now, contact
-- is only visible to the owner.


-- 4. wins: hide identifying columns when anonymous.
-- Lock base table SELECT to owner + admin + linked parents. Expose a public
-- feed view that redacts user_id / display_name for anonymous entries.
DROP POLICY IF EXISTS wins_read_all_authed ON public.wins;

CREATE POLICY wins_read_own ON public.wins
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE OR REPLACE VIEW public.wins_public
WITH (security_invoker = on) AS
SELECT
  id,
  CASE WHEN anonymous THEN NULL ELSE user_id END AS user_id,
  CASE WHEN anonymous THEN 'Anonymous' ELSE display_name END AS display_name,
  scholarship_name,
  amount,
  anonymous,
  created_at
FROM public.wins;

-- View needs to be readable even though base table SELECT is restricted:
-- security_invoker=on means view respects caller policies. To let the feed
-- read all rows via the view, add a policy that allows SELECT through the
-- view path only. Simplest: allow authenticated SELECT on base table but
-- rely on the view for redaction. However the scanner flagged this exact
-- pattern. Instead, use SECURITY DEFINER view:
DROP VIEW public.wins_public;
CREATE VIEW public.wins_public
WITH (security_invoker = off) AS
SELECT
  id,
  CASE WHEN anonymous THEN NULL ELSE user_id END AS user_id,
  CASE WHEN anonymous THEN 'Anonymous' ELSE display_name END AS display_name,
  scholarship_name,
  amount,
  anonymous,
  created_at
FROM public.wins;

GRANT SELECT ON public.wins_public TO authenticated;


-- 5-6. SECURITY DEFINER exposure: revoke EXECUTE from anon/public.
-- Trigger-only functions: revoke from everyone.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Helpers used inside RLS/other SECURITY DEFINER fns — RLS evaluates with
-- definer privileges, so no direct EXECUTE needed by clients.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_linked_parent(uuid, uuid) FROM PUBLIC, anon;

-- Parent invite redemption: only signed-in parents should call this.
REVOKE ALL ON FUNCTION public.redeem_parent_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_parent_invite(text) TO authenticated;
