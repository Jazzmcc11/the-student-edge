import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserType = "student" | "parent" | null;

export function useUserType(): { userType: UserType; loading: boolean } {
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) { setUserType(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      const t = (data?.user_type as UserType) ??
        ((user.user_metadata?.user_type as UserType) || "student");
      setUserType(t);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { userType, loading };
}
