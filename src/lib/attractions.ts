import {
  seedAttractions,
  type AttractionItem,
} from "@/lib/content/attractions";
import { fetchJson } from "@/lib/fetch-json";

const rawPoll = Number(process.env.NEXT_PUBLIC_ATTRACTIONS_POLL_MS ?? 60000);
export const ATTRACTIONS_POLL_MS =
  Number.isFinite(rawPoll) && rawPoll >= 0 ? Math.floor(rawPoll) : 60000;

export function fetchAttractions(): Promise<AttractionItem[]> {
  return fetchJson<AttractionItem[]>(
    "/api/attractions",
    "attractions",
    seedAttractions,
    (data) => Array.isArray(data) && data.length > 0
  );
}

export function mapsUrl(attraction: AttractionItem): string {
  if (attraction.mapUrl) return attraction.mapUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${attraction.name}, Pasikuda, Sri Lanka`
  )}`;
}
