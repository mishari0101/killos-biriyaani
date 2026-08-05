import "server-only";

import { findAll, findById, createDoc, updateDoc, deleteDoc, nextId } from "@/lib/firebase/repo";
import { listBranches } from "@/lib/branches/service";
import { normalizePhone, todayLocalISO, type ReservationInput } from "./validate";
import {
  isReservationStatus,
  type ReservationData,
  type ReservationFilters,
  type ReservationListResult,
  type ReservationRow,
  type ReservationSortKey,
  type ReservationStats,
  type ReservationStatus,
} from "./types";

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isInteger(n) ? n : 0;
}

/** Map a stored row to the API shape. */
export function rowToReservation(row: ReservationRow): ReservationData {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    phone: row.phone,
    email: row.email,
    branch: row.branch,
    guests: row.guests,
    date: row.date,
    time: row.time,
    occasion: row.occasion,
    request: row.request,
    status: (isReservationStatus(row.status) ? row.status : "PENDING") as ReservationStatus,
    notes: row.notes,
    confirmedAt: row.confirmedAt ? row.confirmedAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toReservationInput(raw: Record<string, unknown>): ReservationInput {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    branch: typeof raw.branch === "string" ? raw.branch : "",
    guests: toNumber(raw.guests),
    date: typeof raw.date === "string" ? raw.date : "",
    time: typeof raw.time === "string" ? raw.time : "",
    occasion: typeof raw.occasion === "string" ? raw.occasion : "",
    request: typeof raw.request === "string" ? raw.request : "",
  };
}

/** Current local time as HH:MM, used for today/upcoming/past boundaries. */
function nowTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** The head (featured) visible branch name, used when the public form omits it. */
export async function resolveBranchName(): Promise<string> {
  try {
    const result = await listBranches({ pageSize: 50 });
    const visible = result.items.filter((item) => item.visible);
    if (visible.length === 0) return "";
    const head = visible.find((item) => item.featured) ?? visible[0];
    return head.name;
  } catch {
    return "";
  }
}

export class ReservationNotFoundError extends Error {
  constructor(id: number) {
    super(`Reservation ${id} not found.`);
    this.name = "ReservationNotFoundError";
  }
}

export class DuplicateReservationError extends Error {
  constructor() {
    super("A reservation already exists for this phone, date and time.");
    this.name = "DuplicateReservationError";
  }
}

/** Create a reservation, assigning its human-facing number from the shared counter. */
export async function createReservation(input: ReservationInput): Promise<ReservationData> {
  const phone = normalizePhone(input.phone);
  const rows = await findAll<ReservationRow>("reservations");
  const duplicate = rows.find(
    (row) =>
      row.phone === phone &&
      row.date === input.date &&
      row.time === input.time &&
      (row.status === "PENDING" || row.status === "CONFIRMED")
  );
  if (duplicate) throw new DuplicateReservationError();

  const id = await nextId("reservations");
  const number = `KB-${String(id).padStart(4, "0")}`;
  const row = await createDoc<ReservationRow>("reservations", id, {
    number,
    name: input.name.trim(),
    phone,
    email: input.email.trim(),
    branch: input.branch.trim(),
    guests: input.guests,
    date: input.date,
    time: input.time,
    occasion: input.occasion.trim(),
    request: input.request.trim(),
    status: "PENDING",
    notes: "",
  });

  return rowToReservation(row);
}

const SORT_ORDERS: Record<ReservationSortKey, (a: ReservationRow, b: ReservationRow) => number> = {
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
  oldest: (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id,
  date: (a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time) || b.id - a.id,
  guests: (a, b) => b.guests - a.guests || b.id - a.id,
};

/** Normalized search, status and period filters used by the in-memory matcher. */
export function buildReservationWhere(filters: ReservationFilters): ReservationFilters {
  return {
    search: filters.search ?? "",
    status: filters.status ?? "all",
    period: filters.period ?? "all",
  };
}

function matchesWhere(row: ReservationRow, where: ReservationFilters): boolean {
  const search = where.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.phone} ${row.email} ${row.number} ${row.branch}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  const today = todayLocalISO();

  if (where.period === "upcoming") {
    if (row.status !== "PENDING" && row.status !== "CONFIRMED") return false;
    const t = nowTime();
    return row.date > today || (row.date === today && row.time >= t);
  }

  if (where.status && where.status !== "all" && row.status !== where.status) return false;

  if (where.period === "today") {
    return row.date === today;
  }
  if (where.period === "past") {
    const t = nowTime();
    return row.date < today || (row.date === today && row.time < t);
  }
  return true;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export async function computeStats(): Promise<ReservationStats> {
  const today = todayLocalISO();
  const rows = await findAll<ReservationRow>("reservations");
  let todayCount = 0;
  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let cancelled = 0;
  let upcoming = 0;
  for (const row of rows) {
    if (row.date === today) todayCount += 1;
    if (row.status === "PENDING") pending += 1;
    if (row.status === "CONFIRMED") confirmed += 1;
    if (row.status === "COMPLETED") completed += 1;
    if (row.status === "CANCELLED") cancelled += 1;
    if ((row.status === "PENDING" || row.status === "CONFIRMED") && row.date > today) upcoming += 1;
  }
  return { today: todayCount, pending, confirmed, completed, cancelled, upcoming };
}

/** List reservations with search, status/period filters, sorting and pagination. */
export async function listReservations(filters: ReservationFilters = {}): Promise<ReservationListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 24));

  const where = buildReservationWhere(filters);
  const rows = await findAll<ReservationRow>("reservations");
  const filtered = rows.filter((row) => matchesWhere(row, where));
  filtered.sort(SORT_ORDERS[filters.sort ?? "newest"]);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToReservation);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    stats: await computeStats(),
  };
}

export async function getReservation(id: number): Promise<ReservationData> {
  const row = await findById<ReservationRow>("reservations", id);
  if (!row) throw new ReservationNotFoundError(id);
  return rowToReservation(row);
}

/** Full admin edit of a reservation's booking fields. */
export async function updateReservation(id: number, input: ReservationInput): Promise<ReservationData> {
  const previous = await findById<ReservationRow>("reservations", id);
  if (!previous) throw new ReservationNotFoundError(id);
  const row = await updateDoc<ReservationRow>("reservations", id, {
    name: input.name.trim(),
    phone: normalizePhone(input.phone),
    email: input.email.trim(),
    branch: input.branch.trim(),
    guests: input.guests,
    date: input.date,
    time: input.time,
    occasion: input.occasion.trim(),
    request: input.request.trim(),
  });
  if (!row) throw new ReservationNotFoundError(id);
  return rowToReservation(row);
}

/**
 * Transition a reservation's status. The matching confirmedAt/completedAt/
 * cancelledAt timestamp is set the first time and never overwritten.
 */
export async function updateReservationStatus(id: number, status: ReservationStatus): Promise<ReservationData> {
  const previous = await findById<ReservationRow>("reservations", id);
  if (!previous) throw new ReservationNotFoundError(id);

  const data: Record<string, unknown> = { status };
  const now = new Date();
  if (status === "CONFIRMED" && !previous.confirmedAt) data.confirmedAt = now;
  if (status === "COMPLETED" && !previous.completedAt) data.completedAt = now;
  if (status === "CANCELLED" && !previous.cancelledAt) data.cancelledAt = now;

  const row = await updateDoc<ReservationRow>("reservations", id, data);
  if (!row) throw new ReservationNotFoundError(id);
  return rowToReservation(row);
}

/** Replace the admin-only internal notes. */
export async function updateReservationNotes(id: number, notes: string): Promise<ReservationData> {
  const previous = await findById<ReservationRow>("reservations", id);
  if (!previous) throw new ReservationNotFoundError(id);
  const row = await updateDoc<ReservationRow>("reservations", id, { notes: notes.trim() });
  if (!row) throw new ReservationNotFoundError(id);
  return rowToReservation(row);
}

export async function deleteReservation(id: number): Promise<void> {
  const previous = await findById<ReservationRow>("reservations", id);
  if (!previous) throw new ReservationNotFoundError(id);
  await deleteDoc("reservations", id);
}
