import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUserType } from "@/hooks/use-user-type";

export const Route = createFileRoute("/_authenticated/community/")({
  component: CommunityIndex,
});

function CommunityIndex() {
  const { userType, loading } = useUserType();
  if (loading) return null;
  return <Navigate to={userType === "parent" ? "/community/discussions" : "/community/wins"} replace />;
}
