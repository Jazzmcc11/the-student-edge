import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// US Dept of Education College Scorecard API.
// Docs: https://collegescorecard.ed.gov/data/api-documentation/

const BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";

// Fields we read — keep tight to stay under the per-request size cap.
const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "school.ownership", // 1=public, 2=private nonprofit, 3=for-profit
  "school.minority_serving.historically_black", // HBCU flag
  "latest.student.size",
  "latest.admissions.admission_rate.overall",
  "latest.cost.attendance.academic_year",
  "latest.cost.tuition.in_state",
  "latest.cost.tuition.out_of_state",
].join(",");

type RawSchool = {
  id: number;
  "school.name": string;
  "school.city": string;
  "school.state": string;
  "school.school_url": string | null;
  "school.ownership": number | null;
  "school.minority_serving.historically_black": number | null;
  "latest.student.size": number | null;
  "latest.admissions.admission_rate.overall": number | null;
  "latest.cost.attendance.academic_year": number | null;
  "latest.cost.tuition.in_state": number | null;
  "latest.cost.tuition.out_of_state": number | null;
};

export type CollegeResult = {
  id: number;
  name: string;
  city: string;
  state: string;
  url: string | null;
  ownership: "public" | "private" | "for-profit" | null;
  hbcu: boolean;
  size: number | null;
  admissionRate: number | null; // 0..1
  cost: number | null;
  tuitionIn: number | null;
  tuitionOut: number | null;
};

function shape(s: RawSchool): CollegeResult {
  const own = s["school.ownership"];
  return {
    id: s.id,
    name: s["school.name"],
    city: s["school.city"],
    state: s["school.state"],
    url: s["school.school_url"],
    ownership: own === 1 ? "public" : own === 2 ? "private" : own === 3 ? "for-profit" : null,
    hbcu: s["school.minority_serving.historically_black"] === 1,
    size: s["latest.student.size"],
    admissionRate: s["latest.admissions.admission_rate.overall"],
    cost: s["latest.cost.attendance.academic_year"],
    tuitionIn: s["latest.cost.tuition.in_state"],
    tuitionOut: s["latest.cost.tuition.out_of_state"],
  };
}

export const searchColleges = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        q: z.string().max(80).optional(),
        state: z.string().length(2).optional(),
        hbcuOnly: z.boolean().optional(),
        page: z.number().int().min(0).max(50).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const key = process.env.SCORECARD_API_KEY;
    if (!key) throw new Error("Scorecard is not configured.");

    const params = new URLSearchParams({
      api_key: key,
      fields: FIELDS,
      per_page: "20",
      page: String(data.page ?? 0),
      "school.operating": "1",
      "latest.student.size__range": "100..",
    });
    if (data.q) params.set("school.name", data.q);
    if (data.state) params.set("school.state", data.state.toUpperCase());
    if (data.hbcuOnly) params.set("school.minority_serving.historically_black", "1");
    // Sort by enrollment so well-known schools surface first when no query
    if (!data.q) params.set("sort", "latest.student.size:desc");

    const res = await fetch(`${BASE}?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Scorecard error ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { results: RawSchool[]; metadata: { total: number } };
    return {
      total: json.metadata.total,
      results: json.results.map(shape),
    };
  });
