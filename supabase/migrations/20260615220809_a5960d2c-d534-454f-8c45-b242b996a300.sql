
REVOKE EXECUTE ON FUNCTION public.is_linked_parent(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_parent_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_parent_invite(text) TO authenticated;
