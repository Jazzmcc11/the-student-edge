import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StudentOnly } from "@/components/student-only";

export const Route = createFileRoute("/_authenticated/scholarships")({
  component: () => <StudentOnly><Outlet /></StudentOnly>,
});
