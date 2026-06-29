import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, ArrowLeft, Bug, Lightbulb, HelpCircle, MessageSquare, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback inbox — Admin — The Plug" }] }),
  component: AdminFeedback,
});

type Status = "new" | "triaged" | "resolved" | "wontfix";
type Category = "general" | "bug" | "idea" | "confusing";

interface FeedbackRow {
  id: string;
  user_id: string | null;
  category: Category;
  message: string;
  path: string | null;
  status: Status;
  created_at: string;
}

const CAT_META: Record<Category, { icon: any; label: string; tone: string }> = {
  bug: { icon: Bug, label: "Bug", tone: "text-red-400 border-red-500/30 bg-red-500/10" },
  idea: { icon: Lightbulb, label: "Idea", tone: "text-gold border-gold/30 bg-gold/10" },
  confusing: { icon: HelpCircle, label: "Confusing", tone: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  general: { icon: MessageSquare, label: "General", tone: "text-blue-300 border-blue-400/30 bg-blue-400/10" },
};

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  triaged: "Triaged",
  resolved: "Resolved",
  wontfix: "Won't fix",
};

function AdminFeedback() {
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [rows, setRows] = useState<FeedbackRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("new");

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) return;
    load();
  }, [isAdmin, roleLoading, filter]);

  async function load() {
    setRows(null);
    let q = supabase.from("feedback").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast.error("Couldn't load feedback");
      setRows([]);
      return;
    }
    setRows((data || []) as FeedbackRow[]);
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
    if (error) {
      toast.error("Couldn't update");
      return;
    }
    toast.success(`Marked ${STATUS_LABEL[status].toLowerCase()}`);
    load();
  }

  if (roleLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-4 font-display text-2xl">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">This inbox is restricted to admin accounts.</p>
        <Button onClick={() => navigate({ to: "/dashboard" })} className="mt-6">Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Feedback inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything testers and users have sent through the widget.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="triaged">Triaged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="wontfix">Won't fix</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {rows === null ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No feedback here yet"
            description={filter === "new" ? "When a tester sends feedback, it'll land here first." : "Nothing matches this filter."}
          />
        ) : (
          rows.map((r) => {
            const meta = CAT_META[r.category];
            const Icon = meta.icon;
            return (
              <article key={r.id} className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${meta.tone}`}>
                    <Icon className="h-3 w-3" /> {meta.label}
                  </span>
                  <Badge variant="outline" className="text-xs">{STATUS_LABEL[r.status]}</Badge>
                  {r.path && <span className="font-mono text-xs text-muted-foreground truncate">{r.path}</span>}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status !== "triaged" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "triaged")}>Mark triaged</Button>
                  )}
                  {r.status !== "resolved" && (
                    <Button size="sm" className="bg-gold text-primary-foreground hover:bg-gold/90" onClick={() => updateStatus(r.id, "resolved")}>Resolve</Button>
                  )}
                  {r.status !== "wontfix" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "wontfix")}>Won't fix</Button>
                  )}
                  {r.status !== "new" && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "new")}>Reopen</Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
