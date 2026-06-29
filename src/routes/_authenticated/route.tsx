import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackWidget } from "@/components/feedback-widget";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ThemeProvider } from "@/components/theme-provider";
import { pingActivity } from "@/lib/personalization";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  useEffect(() => {
    pingActivity();
  }, []);
  return (
    <ThemeProvider>
      <Outlet />
      <OnboardingModal />
      <FeedbackWidget />
    </ThemeProvider>
  );
}
