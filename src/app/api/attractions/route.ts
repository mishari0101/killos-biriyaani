import { seedAttractions, type AttractionItem } from "@/lib/content/attractions";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function toAttraction(raw: unknown): AttractionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  const description = typeof r.description === "string" ? r.description.trim() : "";
  if (!name) return null;
  return {
    id:
      typeof r.id === "string" && r.id
        ? r.id
        : `attraction-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    description,
    rating:
      typeof r.rating === "number" && Number.isFinite(r.rating)
        ? Math.min(5, Math.max(0, Math.round(r.rating * 10) / 10))
        : 4.5,
    travelTime:
      typeof r.travelTime === "string" && r.travelTime.trim()
        ? r.travelTime.trim()
        : "Nearby",
    image: typeof r.image === "string" && r.image ? r.image : "",
    mapUrl: typeof r.mapUrl === "string" && r.mapUrl ? r.mapUrl : "",
    featured: r.featured === true,
    imagePosition:
      typeof r.imagePosition === "string" && r.imagePosition.trim()
        ? r.imagePosition.trim()
        : undefined,
  };
}

function normalize(payload: unknown): AttractionItem[] {
  let list: unknown;
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    list = obj.attractions ?? obj.data ?? obj.items ?? [];
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(toAttraction)
    .filter((a): a is AttractionItem => a !== null);
}

export async function GET() {
  const url = process.env.ATTRACTIONS_API_URL;

  if (!url) {
    return Response.json(seedAttractions, { headers: NO_STORE });
  }

  try {
    const token = process.env.ATTRACTIONS_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Attractions API responded ${res.status}`);
    const items = normalize(await res.json());
    return Response.json(items.length ? items : seedAttractions, {
      headers: NO_STORE,
    });
  } catch (error) {
    console.error("[api/attractions]", error);
    return Response.json(seedAttractions, { headers: NO_STORE });
  }
}
