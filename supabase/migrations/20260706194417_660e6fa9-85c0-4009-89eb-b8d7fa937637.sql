CREATE POLICY "Linked parents can view student scholarship applications"
  ON public.scholarship_applications FOR SELECT
  USING (public.is_linked_parent(auth.uid(), user_id));

CREATE POLICY "Linked parents can view student wins"
  ON public.wins FOR SELECT
  USING (public.is_linked_parent(auth.uid(), user_id));