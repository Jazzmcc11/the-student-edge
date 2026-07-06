import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";

/**
 * Banner shown at the top of the student dashboard when there are
 * unread nudges from parents or new parent comments on essays.
 */
export function StudentAlerts({ studentId }: { studentId: string }) {
  const [nudges, setNudges] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Unread nudges (server tracks read_at)
      const { count: nudgeCount } = await supabase
        .from("nudges")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId)
        .is("read_at", null);

      // Parent essay comments — client-side "seen" tracker in localStorage
      const seenKey = `essay_comments_seen_${studentId}`;
      const seenAt = localStorage.getItem(seenKey) || "1970-01-01";
      const { count: commentCount } = await supabase
        .from("essay_comments")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId)
        .neq("author_id", studentId)
        .gt("created_at", seenAt);

      if (!mounted) return;
      setNudges(nudgeCount || 0);
      setComments(commentCount || 0);
    })();
    return () => { mounted = false; };
  }, [studentId]);

  if (!nudges && !comments) return null;

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2">
      {nudges > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
              <Heart className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gold">Someone's cheering for you</p>
              <p className="font-medium">
                {nudges} new note{nudges === 1 ? "" : "s"} from your people
              </p>
            </div>
          </div>
          <Link to="/family" className="inline-flex items-center text-sm text-gold">
            Read <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      )}
      {comments > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
              <MessageSquare className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Feedback on your essays</p>
              <p className="font-medium">
                {comments} new comment{comments === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link to="/essays" className="inline-flex items-center text-sm text-gold">
            Open <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Call from the essays page when opened so the "unread comments" banner clears.
 */
export function markEssayCommentsSeen(studentId: string) {
  localStorage.setItem(`essay_comments_seen_${studentId}`, new Date().toISOString());
}
