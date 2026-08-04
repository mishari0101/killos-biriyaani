import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
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

/** Map a Prisma row to the API shape. */
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

/** Create a reservation, assigning its human-facing number inside a transaction. */
export async function createReservation(input: ReservationInput): Promise<ReservationData> {
  const phone = normalizePhone(input.phone);
  const duplicate = await db.reservation.findFirst({
    where: {
      phone,
      date: input.date,
      time: input.time,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { id: true },
  });
  if (duplicate) throw new DuplicateReservationError();

  const row = await db.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        number: "",
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
      },
    });
    const number = `KB-${String(created.id).padStart(4, "0")}`;
    return tx.reservation.update({
      where: { id: created.id },
      data: { number },
    });
  });

  return rowToReservation(row);
}

const SORT_ORDERS: Record<ReservationSortKey, Prisma.ReservationOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  oldest: [{ createdAt: "asc" }, { id: "asc" }],
  date: [{ date: "desc" }, { time: "desc" }, { id: "desc" }],
  guests: [{ guests: "desc" }, { id: "desc" }],
};

function searchClause(search: string): Prisma.ReservationWhereInput | undefined {
  const q = search.trim();
  if (!q) return undefined;
  return {
    OR: [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      { number: { contains: q } },
      { branch: { contains: q } },
    ],
  };
}

/** Build the Prisma where clause for search, status and period filters. */
export function buildReservationWhere(
  filters: ReservationFilters
): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {};

  const search = searchClause(filters.search ?? "");
  if (search) where.AND = search;

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  const today = todayLocalISO();
  if (filters.period === "today") {
    where.date = today;
  } else if (filters.period === "upcoming") {
    const t = nowTime();
    where.OR = [
      { date: { gt: today } },
      { AND: [{ date: today }, { time: { gte: t } }] },
    ];
    where.status = { in: ["PENDING", "CONFIRMED"] };
  } else if (filters.period === "past") {
    const t = nowTime();
    where.OR = [
      { date: { lt: today } },
      { AND: [{ date: today }, { time: { lt: t } }] },
    ];
  }

  return where;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export async function computeStats(): Promise<ReservationStats> {
  const today = todayLocalISO();
  const [todayCount, pending, confirmed, completed, cancelled, upcoming] = await Promise.all([
    db.reservation.count({ where: { date: today } }),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.reservation.count({ where: { status: "CONFIRMED" } }),
    db.reservation.count({ where: { status: "COMPLETED" } }),
    db.reservation.count({ where: { status: "CANCELLED" } }),
    db.reservation.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [{ date: { gt: today } }],
      },
    }),
  ]);
  return { today: todayCount, pending, confirmed, completed, cancelled, upcoming };
}

/** List reservations with search, status/period filters, sorting and pagination. */
export async function listReservations(filters: ReservationFilters = {}): Promise<ReservationListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 24));

  const where = buildReservationWhere(filters);
  const orderBy = SORT_ORDERS[filters.sort ?? "newest"];

  const [count, items, stats] = await Promise.all([
    db.reservation.count({ where }),
    db.reservation.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    computeStats(),
  ]);

  return {
    items: items.map(rowToReservation),
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    stats,
  };
}

export async function getReservation(id: number): Promise<ReservationData> {
  const row = await db.reservation.findUnique({ where: { id } });
  if (!row) throw new ReservationNotFoundError(id);
  return rowToReservation(row);
}

/** Full admin edit of a reservation's booking fields. */
export async function updateReservation(id: number, input: ReservationInput): Promise<ReservationData> {
  const previous = await db.reservation.findUnique({ where: { id } });
  if (!previous) throw new ReservationNotFoundError(id);
  const row = await db.reservation.update({
    where: { id },
    data: {
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      email: input.email.trim(),
      branch: input.branch.trim(),
      guests: input.guests,
      date: input.date,
      time: input.time,
      occasion: input.occasion.trim(),
      request: input.request.trim(),
    },
  });
  return rowToReservation(row);
}

/**
 * Transition a reservation's status. The matching confirmedAt/completedAt/
 * cancelledAt timestamp is set the first time and never overwritten.
 */
export async function updateReservationStatus(id: number, status: ReservationStatus): Promise<ReservationData> {
  const previous = await db.reservation.findUnique({ where: { id } });
  if (!previous) throw new ReservationNotFoundError(id);

  const now = new Date();
  const data: Prisma.ReservationUpdateInput = { status };
  if (status === "CONFIRMED" && !previous.confirmedAt) data.confirmedAt = now;
  if (status === "COMPLETED" && !previous.completedAt) data.completedAt = now;
  if (status === "CANCELLED" && !previous.cancelledAt) data.cancelledAt = now;

  const row = await db.reservation.update({ where: { id }, data });
  return rowToReservation(row);
}

/** Replace the admin-only internal notes. */
export async function updateReservationNotes(id: number, notes: string): Promise<ReservationData> {
  const previous = await db.reservation.findUnique({ where: { id } });
  if (!previous) throw new ReservationNotFoundError(id);
  const row = await db.reservation.update({
    where: { id },
    data: { notes: notes.trim() },
  });
  return rowToReservation(row);
}

export async function deleteReservation(id: number): Promise<void> {
  const previous = await db.reservation.findUnique({ where: { id } });
  if (!previous) throw new ReservationNotFoundError(id);
  await db.reservation.delete({ where: { id } });
}
