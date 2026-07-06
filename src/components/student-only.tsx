import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserType } from "@/hooks/use-user-type";

/**
 * Wrap a page that should only be accessible to students.
 * Parents get bounced back to their dashboard.
 */
export function StudentOnly({ children }: { children: React.ReactNode }) {
  const { userType, loading } = useUserType();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userType === "parent") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, userType, navigate]);

  if (loading || userType === "parent") return null;
  return <>{children}</>;
}
