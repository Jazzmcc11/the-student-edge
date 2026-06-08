import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Users, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Plug" },
      { name: "description", content: "Sign in or create your student or parent account on The Plug." },
    ],
  }),
  component: AuthPage,
});

type Role = "student" | "parent";

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, user_type: role },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to The Plug.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-night px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-gold">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <span className="font-display text-lg font-bold text-primary-foreground">P</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold leading-tight">The Plug</h1>
              <p className="text-xs text-muted-foreground">Your unfair advantage</p>
            </div>
          </div>

          {/* Role toggle */}
          <div className="mb-6">
            <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              I am a
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  role === "student"
                    ? "border-gold bg-gold/10 text-gold shadow-gold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold/40"
                }`}
              >
                <GraduationCap className="h-4 w-4" /> I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                  role === "parent"
                    ? "border-gold bg-gold/10 text-gold shadow-gold"
                    : "border-border bg-secondary text-muted-foreground hover:border-gold/40"
                }`}
              >
                <Users className="h-4 w-4" /> I'm a Parent
              </button>
            </div>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <TabsContent value="signup" className="m-0 space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    required={mode === "signup"}
                  />
                </div>
              </TabsContent>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-95"
              >
                {loading ? "Please wait…" : mode === "signup" ? `Create ${role} account` : "Sign in"}
              </Button>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
