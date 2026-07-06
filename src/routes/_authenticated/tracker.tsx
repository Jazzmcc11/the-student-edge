import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tracker")({
  component: TrackerLayout,
});

function TrackerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tab = (href: string, label: string) => (
    <Link
      to={href}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        pathname === href
          ? "border-gold bg-gold/10 text-gold"
          : "border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm text-gold">My tracker</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Applications</h1>
        </div>
        <div className="mb-8 flex gap-2">
          {tab("/tracker/colleges", "Colleges")}
          {tab("/tracker/scholarships", "Scholarships")}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
