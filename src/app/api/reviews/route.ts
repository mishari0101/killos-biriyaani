import { seedReviews, type ReviewItem } from "@/lib/content/reviews";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function toReview(raw: unknown): ReviewItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  const text = typeof r.text === "string" ? r.text.trim() : "";
  if (!name || !text) return null;
  const rawRating = typeof r.rating === "number" ? r.rating : 5;
  return {
    id:
      typeof r.id === "string" && r.id
        ? r.id
        : `review-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    rating: Math.min(5, Math.max(1, Math.round(rawRating))),
    date: typeof r.date === "string" && r.date ? r.date : "Verified review",
    text,
    image: typeof r.image === "string" && r.image ? r.image : undefined,
    pinned: r.pinned === true,
  };
}

function normalize(payload: unknown): ReviewItem[] {
  let list: unknown;
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    list = obj.reviews ?? obj.data ?? obj.items ?? [];
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(toReview)
    .filter((r): r is ReviewItem => r !== null);
}

export async function GET() {
  const url = process.env.REVIEWS_API_URL;

  if (!url) {
    return Response.json(seedReviews, { headers: NO_STORE });
  }

  try {
    const token = process.env.REVIEWS_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Reviews API responded ${res.status}`);
    const items = normalize(await res.json());
    return Response.json(items.length ? items : seedReviews, {
      headers: NO_STORE,
    });
  } catch (error) {
    console.error("[api/reviews]", error);
    return Response.json(seedReviews, { headers: NO_STORE });
  }
}
