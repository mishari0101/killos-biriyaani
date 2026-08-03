import { seedReviews, type ReviewItem } from "@/lib/content/reviews";
import { fetchJson } from "@/lib/fetch-json";

const rawInitial = Number(process.env.NEXT_PUBLIC_REVIEWS_INITIAL_COUNT ?? 6);
export const REVIEWS_INITIAL =
  Number.isFinite(rawInitial) && rawInitial > 0 ? Math.floor(rawInitial) : 6;

const rawPoll = Number(process.env.NEXT_PUBLIC_REVIEWS_POLL_MS ?? 60000);
export const REVIEWS_POLL_MS =
  Number.isFinite(rawPoll) && rawPoll >= 0 ? Math.floor(rawPoll) : 60000;

export function fetchReviews(): Promise<ReviewItem[]> {
  return fetchJson<ReviewItem[]>(
    "/api/reviews",
    "reviews",
    seedReviews,
    (data) => Array.isArray(data) && data.length > 0
  );
}
