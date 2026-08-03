import { seedBranches, type BranchItem } from "@/lib/content/branches";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function toPhones(raw: unknown): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
}

function toBranch(raw: unknown): BranchItem | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const address = typeof b.address === "string" ? b.address.trim() : "";
  const phones = toPhones(b.phones ?? b.phone);
  if (!name || !address) return null;
  const mapUrl = typeof b.mapUrl === "string" && b.mapUrl ? b.mapUrl : "";
  return {
    id:
      typeof b.id === "string" && b.id
        ? b.id
        : `branch-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    address,
    hours:
      typeof b.hours === "string" && b.hours ? b.hours : "10:00 AM – 12:00 AM",
    phones: phones.length ? phones : ["076 66 36 37 3", "077 11 22 33 8"],
    mapUrl,
    mapQuery:
      typeof b.mapQuery === "string" && b.mapQuery ? b.mapQuery : undefined,
    primary: b.primary === true,
  };
}

function normalize(payload: unknown): BranchItem[] {
  let list: unknown;
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    list = obj.branches ?? obj.data ?? obj.items ?? [];
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(toBranch)
    .filter((b): b is BranchItem => b !== null)
    .sort(
      (a, b) => Number(b.primary ?? false) - Number(a.primary ?? false)
    );
}

export async function GET() {
  const url = process.env.BRANCHES_API_URL;

  if (!url) {
    return Response.json(seedBranches, { headers: NO_STORE });
  }

  try {
    const token = process.env.BRANCHES_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Branches API responded ${res.status}`);
    const items = normalize(await res.json());
    return Response.json(items.length ? items : seedBranches, {
      headers: NO_STORE,
    });
  } catch (error) {
    console.error("[api/branches]", error);
    return Response.json(seedBranches, { headers: NO_STORE });
  }
}
