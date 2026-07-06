import { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageSquarePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id,
      category,
      message: message.trim(),
      path,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send feedback");
      return;
    }
    toast.success("Thanks — we read every one.");
    setMessage("");
    setCategory("general");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-background/90 px-4 text-sm font-medium text-gold shadow-gold backdrop-blur transition hover:bg-gold hover:text-primary-foreground"
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Help us make this better</DialogTitle>
            <DialogDescription>
              You're one of the first to try The Plug. Tell us what confused you, what didn't work, or what you wish existed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confusing">Something confused me</SelectItem>
                <SelectItem value="bug">Something's broken</SelectItem>
                <SelectItem value="idea">I wish this existed</SelectItem>
                <SelectItem value="love">I love this</SelectItem>
                <SelectItem value="general">Just saying hi</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What confused you? What did you expect to happen? What would make this a 10?"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">Sending from: <span className="font-mono">{path}</span></p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting || !message.trim()} className="bg-gold text-primary-foreground hover:bg-gold/90">
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
