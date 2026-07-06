import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listScholarshipApps from "./tools/list-scholarship-apps";
import createScholarshipApp from "./tools/create-scholarship-app";
import listCollegeApps from "./tools/list-college-apps";
import createCollegeApp from "./tools/create-college-app";
import searchScholarships from "./tools/search-scholarships";
import me from "./tools/me";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "the-plug-mcp",
  title: "The Plug",
  version: "0.1.0",
  instructions:
    "Tools for The Plug — a platform for high schoolers tracking colleges, scholarships, and applications. Use `me` to identify the signed-in user, `list_scholarship_apps` and `list_college_apps` to read the user's tracker, `create_*` tools to add entries, and `search_scholarships` to browse the public scholarship database.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    me,
    listScholarshipApps,
    createScholarshipApp,
    listCollegeApps,
    createCollegeApp,
    searchScholarships,
  ],
});
