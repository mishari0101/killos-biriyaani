import { seedBranches, type BranchItem } from "@/lib/content/branches";
import { fetchJson } from "@/lib/fetch-json";

const rawPoll = Number(process.env.NEXT_PUBLIC_BRANCHES_POLL_MS ?? 60000);
export const BRANCHES_POLL_MS =
  Number.isFinite(rawPoll) && rawPoll >= 0 ? Math.floor(rawPoll) : 60000;

export function fetchBranches(): Promise<BranchItem[]> {
  return fetchJson<BranchItem[]>(
    "/api/branches",
    "branches",
    seedBranches,
    (data) => Array.isArray(data) && data.length > 0
  );
}

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#";
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith("94")) return `tel:+${digits}`;
  if (digits.startsWith("7")) return `tel:+94${digits}`;
  if (digits.startsWith("0")) return `tel:+94${digits.slice(1)}`;
  return `tel:${digits}`;
}

export function directionsUrl(branch: BranchItem): string {
  const query = branch.mapQuery || `${branch.address}, Sri Lanka`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function mapEmbedUrl(branch: BranchItem): string {
  const query = branch.mapQuery || `${branch.address}, Sri Lanka`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}
