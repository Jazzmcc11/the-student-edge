// Community-submitted parent articles (FUBU library).
// Rendered alongside the static ARTICLES on /parent/resources.

import { supabase } from "@/integrations/supabase/client";

export interface ParentSubmittedArticle {
  id: string;
  author_id: string;
  author_display_name: string;
  author_child_grade: string | null;
  title: string;
  blurb: string;
  body: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SUBMISSION_CATEGORY_OPTIONS = [
  { id: "senior-year", label: "Senior year survival" },
  { id: "financial", label: "Paying for it" },
  { id: "grad-party", label: "Graduation & parties" },
  { id: "wellbeing", label: "Family well-being" },
  { id: "first-year", label: "Freshman year prep" },
] as const;

export async function fetchApprovedSubmissions(): Promise<ParentSubmittedArticle[]> {
  const { data, error } = await supabase
    .from("parent_articles")
    .select("*")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ParentSubmittedArticle[];
}

export async function fetchMySubmissions(userId: string): Promise<ParentSubmittedArticle[]> {
  const { data, error } = await supabase
    .from("parent_articles")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ParentSubmittedArticle[];
}

export async function submitParentArticle(input: {
  author_id: string;
  author_display_name: string;
  author_child_grade: string | null;
  title: string;
  blurb: string;
  body: string;
  category: string;
}) {
  const { error } = await supabase.from("parent_articles").insert({
    ...input,
    status: "pending",
  });
  if (error) throw error;
}
