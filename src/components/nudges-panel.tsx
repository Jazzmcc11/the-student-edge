import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Nudge = {
  id: string;
  parent_id: string;
  student_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

const QUICK = [
  "Proud of you 💛",
  "You've got this — one app at a time.",
  "Take a breath. Then send the next one.",
  "I see how hard you're working.",
];

export function NudgesPanel({
  viewerRole,
  viewerId,
  studentId,
  parentId,
  studentName,
}: {
  viewerRole: "student" | "parent";
  viewerId: string;
  studentId: string;
  parentId: string;
  studentName?: string;
}) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("nudges")
      .select("*")
      .eq("parent_id", parentId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNudges((data as Nudge[]) || []);
  }, [parentId, studentId]);

  useEffect(() => {
    load();
    // Mark unread as read when student opens
    if (viewerRole === "student") {
      supabase
        .from("nudges")
        .update({ read_at: new Date().toISOString() })
        .eq("student_id", viewerId)
        .eq("parent_id", parentId)
        .is("read_at", null)
        .then(() => load());
    }
  }, [load, viewerRole, viewerId, parentId]);

  async function send(msg: string) {
    const message = msg.trim();
    if (!message) return;
    setBusy(true);
    const { error } = await supabase.from("nudges").insert({
      parent_id: parentId,
      student_id: studentId,
      message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    toast.success("Nudge sent 💛");
    load();
  }

  async function remove(id: string) {
    await supabase.from("nudges").delete().eq("id", id);
    load();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-4 w-4 text-gold" />
        <h3 className="font-display text-lg font-semibold">
          {viewerRole === "parent" ? `Nudge ${studentName || "your student"}` : "Notes from your people"}
        </h3>
      </div>

      {viewerRole === "parent" && (
        <div className="mb-5 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a short note of encouragement…"
            maxLength={500}
            className="min-h-[80px]"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={busy}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <Button onClick={() => send(text)} disabled={busy || !text.trim()} size="sm" className="bg-gold text-primary-foreground hover:bg-gold/90">
            <Send className="mr-2 h-3.5 w-3.5" /> Send nudge
          </Button>
        </div>
      )}

      {nudges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {viewerRole === "parent" ? "No nudges sent yet — they'll show here." : "No notes yet. Check back soon."}
        </p>
      ) : (
        <ul className="space-y-2">
          {nudges.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                  {viewerRole === "parent" && n.read_at && (
                    <span className="ml-2 inline-flex items-center gap-1 text-gold">
                      <Check className="h-3 w-3" /> read
                    </span>
                  )}
                </p>
              </div>
              {viewerRole === "parent" && (
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
