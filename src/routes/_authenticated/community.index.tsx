import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/community/")({
  component: () => <Navigate to="/community/wins" replace />,
});
