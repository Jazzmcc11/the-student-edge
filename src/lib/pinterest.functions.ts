import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Pinterest API v5 — uses a personal access token stored as PINTEREST_ACCESS_TOKEN.
// We expose two read-only fetches the Creative Resources page needs:
//   1. listBoards()           — the authenticated user's boards (used as category tiles)
//   2. listBoardPins(boardId) — pins inside a chosen board

const API = "https://api.pinterest.com/v5";

type PinterestBoard = {
  id: string;
  name: string;
  description: string | null;
  pin_count: number;
  media: { image_cover_url: string | null } | null;
};

type PinterestPin = {
  id: string;
  title: string | null;
  description: string | null;
  link: string | null;
  media: {
    images?: Record<string, { url: string; width: number; height: number }>;
  } | null;
};

async function pinterest<T>(path: string): Promise<T> {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) throw new Error("Pinterest is not configured.");
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Pinterest token is invalid or expired.");
    if (res.status === 403) throw new Error("Pinterest token is missing required scopes (boards:read, pins:read).");
    throw new Error(`Pinterest error ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export const listBoards = createServerFn({ method: "GET" }).handler(async () => {
  const data = await pinterest<{ items: PinterestBoard[] }>("/boards?page_size=50");
  return {
    boards: data.items.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      pinCount: b.pin_count,
      cover: b.media?.image_cover_url ?? null,
    })),
  };
});

export const listBoardPins = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ boardId: z.string().min(1).max(64) }).parse(data))
  .handler(async ({ data }) => {
    const res = await pinterest<{ items: PinterestPin[] }>(
      `/boards/${encodeURIComponent(data.boardId)}/pins?page_size=25`,
    );
    return {
      pins: res.items.map((p) => {
        const imgs = p.media?.images ?? {};
        // Pick the largest available image
        const sizes = Object.values(imgs).sort((a, b) => b.width - a.width);
        const img = sizes[0] ?? null;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          link: p.link,
          image: img?.url ?? null,
          width: img?.width ?? null,
          height: img?.height ?? null,
        };
      }),
    };
  });
