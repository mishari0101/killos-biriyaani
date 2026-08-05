import "server-only";

import { findAll, findById, createDoc, updateDoc, deleteDoc, updateMany, nextId } from "@/lib/firebase/repo";
import { imageStorage } from "@/lib/uploads/storage";
import { DAYS, type DayHours } from "@/lib/settings/types";
import type { BranchItem } from "@/lib/content/branches";
import { slugifyBranch, type BranchInput } from "./validate";
import type { BranchContactInfo, BranchData, BranchFilters, BranchListResult, BranchRow } from "./types";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

/** Normalize the stored JSON hours array into a typed DayHours[] (Mon–Sun). */
export function parseHours(raw: unknown): DayHours[] {
  const known = new Set(DAYS);
  if (!Array.isArray(raw)) return [];
  const out: DayHours[] = [];
  for (const day of DAYS) {
    const entry = raw.find(
      (r): r is Record<string, unknown> => !!r && typeof r === "object" && (r as { day?: unknown }).day === day
    );
    if (!entry) {
      out.push({ day, open: "10:00", close: "00:00", closed: false });
      continue;
    }
    const open = typeof entry.open === "string" && known.has(day) ? entry.open : "10:00";
    const close = typeof entry.close === "string" ? entry.close : "00:00";
    out.push({
      day,
      open,
      close,
      closed: entry.closed === true,
    });
  }
  return out;
}

/** Map a stored row to the API shape. */
export function rowToBranch(row: BranchRow): BranchData {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.imageUrl,
    address: row.address,
    mapsUrl: row.mapsUrl,
    latitude: row.latitude,
    longitude: row.longitude,
    primaryPhone: row.primaryPhone,
    secondaryPhone: row.secondaryPhone,
    whatsapp: row.whatsapp,
    email: row.email,
    hours: parseHours(row.hours),
    description: row.description,
    displayOrder: row.displayOrder,
    featured: row.featured,
    visible: row.visible,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toBranchInput(raw: Record<string, unknown>): BranchInput {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
    address: typeof raw.address === "string" ? raw.address : "",
    mapsUrl: typeof raw.mapsUrl === "string" ? raw.mapsUrl : "",
    latitude: toNumber(raw.latitude),
    longitude: toNumber(raw.longitude),
    primaryPhone: typeof raw.primaryPhone === "string" ? raw.primaryPhone : "",
    secondaryPhone: typeof raw.secondaryPhone === "string" ? raw.secondaryPhone : "",
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : "",
    email: typeof raw.email === "string" ? raw.email : "",
    hours: parseHours(raw.hours),
    description: typeof raw.description === "string" ? raw.description : "",
    displayOrder: Math.trunc(toNumber(raw.displayOrder)),
    featured: toBoolean(raw.featured),
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
  };
}

function comparePublic(a: BranchRow, b: BranchRow): number {
  return Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || a.id - b.id;
}

function matchesFilters(row: BranchRow, filters: BranchFilters): boolean {
  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.address} ${row.primaryPhone}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.visibility === "visible" && !row.visible) return false;
  if (filters.visibility === "hidden" && row.visible) return false;
  if (filters.featured === "featured" && !row.featured) return false;
  if (filters.featured === "regular" && row.featured) return false;
  return true;
}

/** List branches with search, visibility/featured filters and pagination. */
export async function listBranches(filters: BranchFilters = {}): Promise<BranchListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 24));

  const rows = await findAll<BranchRow>("branches");
  const filtered = rows.filter((row) => matchesFilters(row, filters));
  filtered.sort(comparePublic);

  const total = filtered.length;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToBranch),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Fetch a single branch by id. */
export async function getBranch(id: number): Promise<BranchData | null> {
  const row = await findById<BranchRow>("branches", id);
  return row ? rowToBranch(row) : null;
}

/** Pick a slug that is not already taken, appending -2, -3, … on collision. */
async function uniqueSlug(base: string): Promise<string> {
  const clean = slugifyBranch(base);
  if (!clean) return `branch-${Date.now()}`;
  const rows = await findAll<BranchRow>("branches");
  const taken = new Set(rows.filter((r) => r.slug.startsWith(clean)).map((r) => r.slug));
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

/** Create a branch. The slug is auto-generated from the name. */
export async function createBranch(data: BranchInput): Promise<BranchData> {
  const slug = await uniqueSlug(data.name);
  const id = await nextId("branches");
  const row = await createDoc<BranchRow>("branches", id, {
    name: data.name.trim(),
    slug,
    imageUrl: data.imageUrl.trim(),
    address: data.address.trim(),
    mapsUrl: data.mapsUrl.trim(),
    latitude: data.latitude,
    longitude: data.longitude,
    primaryPhone: data.primaryPhone.trim(),
    secondaryPhone: data.secondaryPhone.trim(),
    whatsapp: data.whatsapp.trim(),
    email: data.email.trim(),
    hours: data.hours,
    description: data.description.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  return rowToBranch(row);
}

/** Thrown when a branch does not exist so the API can map it to 404. */
export class BranchNotFoundError extends Error {
  constructor(public id: number) {
    super(`No branch found with id ${id}.`);
    this.name = "BranchNotFoundError";
  }
}

/** Remove a managed image file if the URL points at our upload storage. */
async function removeManagedImage(url: string | null): Promise<void> {
  if (!url) return;
  const key = imageStorage.urlToKey(url);
  if (key) await imageStorage.delete(key);
}

/** Update a branch. The slug stays stable once assigned. */
export async function updateBranch(id: number, data: BranchInput): Promise<BranchData> {
  const previous = await findById<BranchRow>("branches", id);
  if (!previous) throw new BranchNotFoundError(id);
  const row = await updateDoc<BranchRow>("branches", id, {
    name: data.name.trim(),
    imageUrl: data.imageUrl.trim(),
    address: data.address.trim(),
    mapsUrl: data.mapsUrl.trim(),
    latitude: data.latitude,
    longitude: data.longitude,
    primaryPhone: data.primaryPhone.trim(),
    secondaryPhone: data.secondaryPhone.trim(),
    whatsapp: data.whatsapp.trim(),
    email: data.email.trim(),
    hours: data.hours,
    description: data.description.trim(),
    displayOrder: data.displayOrder,
    featured: data.featured,
    visible: data.visible,
  });
  if (!row) throw new BranchNotFoundError(id);
  if (previous.imageUrl !== row.imageUrl) {
    await removeManagedImage(previous.imageUrl);
  }
  return rowToBranch(row);
}

/** Delete a branch and its managed image. */
export async function deleteBranch(id: number): Promise<void> {
  const previous = await findById<BranchRow>("branches", id);
  if (!previous) throw new BranchNotFoundError(id);
  await deleteDoc("branches", id);
  await removeManagedImage(previous.imageUrl);
}

/** Persist a drag-and-drop reorder (displayOrder is compacted to 0..n). */
export async function reorderBranches(entries: { id: number; displayOrder: number }[]): Promise<void> {
  await updateMany(
    "branches",
    entries.map((entry) => ({ id: entry.id, data: { displayOrder: entry.displayOrder } }))
  );
}

/* ------------------------- Public derivation helpers ------------------------- */

/** Format "14:05" as "2:05 PM". */
export function formatHour(value: string): string {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function timeToMinutes(value: string): number | null {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Collapse the per-day hours into a single "10:00 AM – 12:00 AM" summary. */
export function hoursSummary(hours: DayHours[]): string {
  const open = hours.filter((h) => !h.closed);
  if (open.length === 0) return "Closed";
  const minutes = open
    .map((h) => ({ open: timeToMinutes(h.open), close: timeToMinutes(h.close) }))
    .filter((x): x is { open: number; close: number } => x.open !== null && x.close !== null);
  if (minutes.length === 0) return "Closed";
  const earliest = Math.min(...minutes.map((x) => x.open));
  const latest = Math.max(...minutes.map((x) => x.close));
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return formatHour(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };
  return `${fmt(earliest)} – ${fmt(latest)}`;
}

/** Earliest open hour across the week (24 for a midnight close). */
export function openFromHour(hours: DayHours[]): number {
  let min = 24;
  for (const h of hours) {
    if (h.closed) continue;
    const mins = timeToMinutes(h.open);
    if (mins !== null) min = Math.min(min, Math.floor(mins / 60));
  }
  return min === 24 ? 0 : min;
}

/** Latest close hour across the week (24 for a midnight close). */
export function openToHour(hours: DayHours[]): number {
  let max = 0;
  for (const h of hours) {
    if (h.closed) continue;
    const mins = timeToMinutes(h.close);
    if (mins !== null) {
      const rounded = Math.ceil(mins / 60);
      max = Math.max(max, rounded === 24 ? 24 : rounded);
    }
  }
  return max;
}

function branchPhones(item: BranchData): string[] {
  const phones = [item.primaryPhone.trim()];
  if (item.secondaryPhone.trim() && !phones.includes(item.secondaryPhone.trim())) {
    phones.push(item.secondaryPhone.trim());
  }
  return phones.filter(Boolean);
}

/** Map a branch to the public BranchItem shape the sections render. */
export function rowToPublicBranch(item: BranchData): BranchItem {
  const hasCoords = item.latitude !== 0 || item.longitude !== 0;
  return {
    id: String(item.id),
    name: item.name,
    address: item.address,
    hours: hoursSummary(item.hours),
    phones: branchPhones(item),
    mapUrl: item.mapsUrl,
    mapQuery: hasCoords ? `${item.latitude},${item.longitude}` : item.address,
    primary: item.featured,
  };
}

/** Derived contact details from the visible branches (head branch drives contact). */
export function branchContactInfo(items: BranchData[]): BranchContactInfo {
  const visible = items.filter((i) => i.visible).sort((a, b) => Number(b.featured) - Number(a.featured));
  const head = visible.find((i) => i.featured) ?? visible[0];
  const fallbackHours: DayHours[] = DAYS.map((day) => ({
    day,
    open: "10:00",
    close: "00:00",
    closed: false,
  }));

  const phones = visible.flatMap(branchPhones);
  const uniquePhones = phones.filter((p, i) => phones.indexOf(p) === i);

  return {
    phones: uniquePhones.length ? uniquePhones : ["076 66 36 37 3", "077 11 22 33 8"],
    whatsapp: head?.whatsapp?.trim() || head?.primaryPhone?.trim() || uniquePhones[0] || "076 66 36 37 3",
    whatsappMessage: "Hello Killo's Biriyani! I'd like to reserve a table.",
    email: head?.email?.trim() ?? "",
    addresses: visible.map((i) => i.address),
    hoursNote: "Open Daily",
    hours: head ? hoursSummary(head.hours) : hoursSummary(fallbackHours),
    openFromHour: head ? openFromHour(head.hours) : 10,
    openToHour: head ? openToHour(head.hours) : 24,
  };
}
