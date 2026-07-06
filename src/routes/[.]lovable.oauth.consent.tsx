import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthClient = { name?: string | null; logo_uri?: string | null } | null | undefined;
type AuthorizationDetails = {
  client?: OAuthClient;
  redirect_url?: string | null;
  redirect_to?: string | null;
};
type OAuthResponse<T> = { data: T | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResponse<AuthorizationDetails>>;
  approveAuthorization: (id: string) => Promise<OAuthResponse<AuthorizationDetails>>;
  denyAuthorization: (id: string) => Promise<OAuthResponse<AuthorizationDetails>>;
};
function oauthApi(): OAuthApi {
  const anyAuth = supabase.auth as unknown as { oauth: OAuthApi };
  return anyAuth.oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) {
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">Authorization error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-night px-4">
      <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-card p-8 shadow-gold">
        <h1 className="font-display text-2xl font-bold">Connect {clientName} to The Plug</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} is requesting access to use The Plug on your behalf — reading your college
          and scholarship tracker and adding entries you approve.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <Button
            onClick={() => decide(true)}
            disabled={busy}
            className="flex-1 bg-gradient-gold text-primary-foreground"
          >
            {busy ? "Working…" : "Approve"}
          </Button>
          <Button
            onClick={() => decide(false)}
            disabled={busy}
            variant="outline"
            className="flex-1"
          >
            Deny
          </Button>
        </div>
      </div>
    </main>
  );
}
