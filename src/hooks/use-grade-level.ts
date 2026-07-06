import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useGradeLevel(): { grade: number | null; loading: boolean } {
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) { setLoading(false); } return; }
      const { data } = await supabase
        .from("profiles")
        .select("grade_level")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      const g = data?.grade_level;
      const n = typeof g === "string" ? parseInt(g, 10) : (typeof g === "number" ? g : null);
      setGrade(Number.isFinite(n as number) ? (n as number) : null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { grade, loading };
}
