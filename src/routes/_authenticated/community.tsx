import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Users, BookOpen, MessageSquare } from "lucide-react";
import { useUserType } from "@/hooks/use-user-type";
import { useGradeLevel } from "@/hooks/use-grade-level";
import { FreshmanCommunityHub } from "@/components/freshman-community-hub";
import { JuniorCommunityHub } from "@/components/junior-community-hub";


export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Community — The Plug" }] }),
  component: CommunityLayout,
});

const ALL_TABS = [
  { to: "/community/wins", label: "Wins", icon: Trophy, studentOnly: false },
  { to: "/community/buddies", label: "Study buddies", icon: Users, studentOnly: true },
  { to: "/community/advice", label: "Advice", icon: BookOpen, studentOnly: false },
  { to: "/community/discussions", label: "Discussions", icon: MessageSquare, studentOnly: false },
] as const;

function CommunityLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { userType } = useUserType();
  const { grade } = useGradeLevel();
  const tabs = ALL_TABS.filter((t) => !t.studentOnly || userType !== "parent");
  const isTopLevel = ["/community/wins", "/community/discussions", "/community/advice", "/community/buddies"].includes(pathname);
  const showFreshmanHub = userType !== "parent" && grade === 9 && isTopLevel;
  const showJuniorHub = userType !== "parent" && grade === 11 && isTopLevel;

  return (
    <div className="min-h-screen bg-gradient-night">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="font-display text-lg font-semibold tracking-tight">Community</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav className="-mx-1 flex gap-2 overflow-x-auto border-b border-border/40 pb-3">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-gold/15 text-gold border border-gold/40"
                    : "text-muted-foreground hover:text-gold border border-transparent"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {showFreshmanHub && <FreshmanCommunityHub />}
        {showJuniorHub && <JuniorCommunityHub />}
        <Outlet />
      </main>
    </div>
  );
}
