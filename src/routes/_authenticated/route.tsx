import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackWidget } from "@/components/feedback-widget";
import { OnboardingModal } from "@/components/onboarding-modal";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <>
      <Outlet />
      <OnboardingModal />
      <FeedbackWidget />
    </>
  ),
});
