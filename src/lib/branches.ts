import type { BranchItem } from "@/lib/content/branches";

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
