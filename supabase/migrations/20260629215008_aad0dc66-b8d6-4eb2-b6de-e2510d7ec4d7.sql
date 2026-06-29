
-- Reminders for upcoming deadlines (in-app notifications)
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_date_id uuid REFERENCES public.key_dates(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  due_date date NOT NULL,
  days_out int NOT NULL,
  url text,
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key_date_id, days_out)
);

CREATE INDEX reminders_user_unread_idx ON public.reminders(user_id, read_at, due_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT ALL ON public.reminders TO service_role;

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own reminders" ON public.reminders
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users update own reminders" ON public.reminders
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users delete own reminders" ON public.reminders
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notification preferences on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_reminders boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_lead_days int[] NOT NULL DEFAULT ARRAY[14, 7, 1];
