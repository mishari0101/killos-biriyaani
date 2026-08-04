import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { resolveBranchName } from "@/lib/reservations/service";
export { resolveBranchName };
import { normalizePhone, type ContactMessageInput } from "./validate";
import {
  isContactMessageStatus,
  type ContactMessageData,
  type ContactMessageFilters,
  type ContactMessageListResult,
  type ContactMessageRow,
  type ContactMessageSortKey,
  type ContactMessageStats,
  type ContactMessageStatus,
} from "./types";
import { DUPLICATE_WINDOW_MINUTES } from "./validate";

/** Map a Prisma row to the API shape. */
export function rowToContactMessage(row: ContactMessageRow): ContactMessageData {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    phone: row.phone,
    email: row.email,
    subject: row.subject,
    message: row.message,
    branch: row.branch,
    status: (isContactMessageStatus(row.status)
      ? row.status
      : "NEW") as ContactMessageStatus,
    notes: row.notes,
    repliedAt: row.repliedAt ? row.repliedAt.toISOString() : null,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Coerce raw input into a validated shape (missing fields become defaults). */
export function toContactMessageInput(raw: Record<string, unknown>): ContactMessageInput {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    email: typeof raw.email === "string" ? raw.email : "",
    subject: typeof raw.subject === "string" ? raw.subject : "",
    message: typeof raw.message === "string" ? raw.message : "",
    branch: typeof raw.branch === "string" ? raw.branch : "",
  };
}

export class ContactMessageNotFoundError extends Error {
  constructor(id: number) {
    super(`Contact message ${id} not found.`);
    this.name = "ContactMessageNotFoundError";
  }
}

export class DuplicateContactMessageError extends Error {
  constructor() {
    super("A very similar message from this phone number was just received.");
    this.name = "DuplicateContactMessageError";
  }
}

/** Create a message, assigning its human-facing number inside a transaction. */
export async function createContactMessage(
  input: ContactMessageInput
): Promise<ContactMessageData> {
  const phone = normalizePhone(input.phone);
  const message = input.message.trim();
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000);

  const duplicate = await db.contactMessage.findFirst({
    where: {
      phone,
      message,
      createdAt: { gte: windowStart },
    },
    select: { id: true },
  });
  if (duplicate) throw new DuplicateContactMessageError();

  const row = await db.$transaction(async (tx) => {
    const created = await tx.contactMessage.create({
      data: {
        number: "",
        name: input.name.trim(),
        phone,
        email: input.email.trim(),
        subject: input.subject.trim(),
        message,
        branch: input.branch.trim(),
        status: "NEW",
        notes: "",
      },
    });
    const number = `CM-${String(created.id).padStart(4, "0")}`;
    return tx.contactMessage.update({
      where: { id: created.id },
      data: { number },
    });
  });

  return rowToContactMessage(row);
}

/** Start of the current local day (midnight) as a Date. */
function startOfLocalDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Start of the current local week (Monday midnight) as a Date. */
function startOfLocalWeek(): Date {
  const today = startOfLocalDay();
  const day = today.getDay();
  const sinceMonday = (day + 6) % 7;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - sinceMonday);
}

const SORT_ORDERS: Record<
  ContactMessageSortKey,
  Prisma.ContactMessageOrderByWithRelationInput[]
> = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  oldest: [{ createdAt: "asc" }, { id: "asc" }],
  name: [{ name: "asc" }, { id: "asc" }],
  status: [{ status: "asc" }, { createdAt: "desc" }, { id: "desc" }],
};

function searchClause(search: string): Prisma.ContactMessageWhereInput | undefined {
  const q = search.trim();
  if (!q) return undefined;
  return {
    OR: [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      { number: { contains: q } },
      { subject: { contains: q } },
    ],
  };
}

/** Build the Prisma where clause for search, status and period filters. */
export function buildContactMessageWhere(
  filters: ContactMessageFilters
): Prisma.ContactMessageWhereInput {
  const where: Prisma.ContactMessageWhereInput = {};

  const search = searchClause(filters.search ?? "");
  if (search) where.AND = search;

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.period === "today") {
    where.createdAt = { gte: startOfLocalDay() };
  } else if (filters.period === "week") {
    where.createdAt = { gte: startOfLocalWeek() };
  } else if (filters.period === "month") {
    const now = new Date();
    where.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  }

  return where;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export async function computeStats(): Promise<ContactMessageStats> {
  const [newCount, unread, replied, closed, spam, today] = await Promise.all([
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { status: { in: ["NEW", "READ"] } } }),
    db.contactMessage.count({ where: { status: "REPLIED" } }),
    db.contactMessage.count({ where: { status: "CLOSED" } }),
    db.contactMessage.count({ where: { status: "SPAM" } }),
    db.contactMessage.count({ where: { createdAt: { gte: startOfLocalDay() } } }),
  ]);
  return { new: newCount, unread, replied, closed, spam, today };
}

/** List messages with search, status/period filters, sorting and pagination. */
export async function listContactMessages(
  filters: ContactMessageFilters = {}
): Promise<ContactMessageListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 24));

  const where = buildContactMessageWhere(filters);
  const orderBy = SORT_ORDERS[filters.sort ?? "newest"];

  const [count, items, stats] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    computeStats(),
  ]);

  return {
    items: items.map(rowToContactMessage),
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    stats,
  };
}

export async function getContactMessage(id: number): Promise<ContactMessageData> {
  const row = await db.contactMessage.findUnique({ where: { id } });
  if (!row) throw new ContactMessageNotFoundError(id);
  return rowToContactMessage(row);
}

/**
 * Transition a message's status. The matching repliedAt/closedAt timestamp is
 * set the first time and never overwritten.
 */
export async function updateContactMessageStatus(
  id: number,
  status: ContactMessageStatus
): Promise<ContactMessageData> {
  const previous = await db.contactMessage.findUnique({ where: { id } });
  if (!previous) throw new ContactMessageNotFoundError(id);

  const now = new Date();
  const data: Prisma.ContactMessageUpdateInput = { status };
  if (status === "REPLIED" && !previous.repliedAt) data.repliedAt = now;
  if (status === "CLOSED" && !previous.closedAt) data.closedAt = now;

  const row = await db.contactMessage.update({ where: { id }, data });
  return rowToContactMessage(row);
}

/** Replace the admin-only internal notes. */
export async function updateContactMessageNotes(
  id: number,
  notes: string
): Promise<ContactMessageData> {
  const previous = await db.contactMessage.findUnique({ where: { id } });
  if (!previous) throw new ContactMessageNotFoundError(id);
  const row = await db.contactMessage.update({
    where: { id },
    data: { notes: notes.trim() },
  });
  return rowToContactMessage(row);
}

export async function deleteContactMessage(id: number): Promise<void> {
  const previous = await db.contactMessage.findUnique({ where: { id } });
  if (!previous) throw new ContactMessageNotFoundError(id);
  await db.contactMessage.delete({ where: { id } });
}
