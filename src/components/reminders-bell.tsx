import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

type Reminder = {
  id: string;
  title: string;
  body: string | null;
  due_date: string;
  days_out: number;
  url: string | null;
  read_at: string | null;
};

export function RemindersBell() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reminders")
      .select("id,title,body,due_date,days_out,url,read_at")
      .order("due_date", { ascending: true })
      .limit(20);
    setItems((data as Reminder[]) ?? []);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("reminders-bell")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reminders" },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const unread = items.filter((i) => !i.read_at).length;

  const markRead = async (id: string) => {
    await supabase
      .from("reminders")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  };

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.read_at).map((i) => i.id);
    if (!ids.length) return;
    await supabase
      .from("reminders")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
    toast.success("All caught up");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Reminders">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="font-semibold text-sm">Deadline reminders</div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              No upcoming deadlines.
              <div className="mt-2">
                <Link to="/calendar" className="text-primary underline">
                  Open calendar
                </Link>
              </div>
            </div>
          ) : (
            items.map((r) => (
              <div
                key={r.id}
                className={`px-3 py-2 border-b last:border-0 text-sm ${
                  !r.read_at ? "bg-muted/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground">
                      In {r.days_out} day{r.days_out === 1 ? "" : "s"} ·{" "}
                      {new Date(r.due_date + "T00:00:00").toLocaleDateString()}
                    </div>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline"
                      >
                        Details
                      </a>
                    )}
                  </div>
                  {!r.read_at && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => markRead(r.id)}
                      aria-label="Mark read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-2">
          <Link
            to="/calendar"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            View full calendar →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
