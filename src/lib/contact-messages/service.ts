import "server-only";

import { findAll, findById, createDoc, updateDoc, deleteDoc, nextId } from "@/lib/firebase/repo";
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

/** Map a stored row to the API shape. */
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

/** Create a message, assigning its human-facing number from the shared counter. */
export async function createContactMessage(
  input: ContactMessageInput
): Promise<ContactMessageData> {
  const phone = normalizePhone(input.phone);
  const message = input.message.trim();
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000);

  const rows = await findAll<ContactMessageRow>("contactMessages");
  const duplicate = rows.find(
    (row) => row.phone === phone && row.message === message && row.createdAt.getTime() >= windowStart.getTime()
  );
  if (duplicate) throw new DuplicateContactMessageError();

  const id = await nextId("contactMessages");
  const number = `CM-${String(id).padStart(4, "0")}`;
  const row = await createDoc<ContactMessageRow>("contactMessages", id, {
    number,
    name: input.name.trim(),
    phone,
    email: input.email.trim(),
    subject: input.subject.trim(),
    message,
    branch: input.branch.trim(),
    status: "NEW",
    notes: "",
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

const SORT_ORDERS: Record<ContactMessageSortKey, (a: ContactMessageRow, b: ContactMessageRow) => number> = {
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
  oldest: (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name) || a.id - b.id,
  status: (a, b) => a.status.localeCompare(b.status) || b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
};

/** Normalized search, status and period filters used by the in-memory matcher. */
export function buildContactMessageWhere(filters: ContactMessageFilters): ContactMessageFilters {
  return {
    search: filters.search ?? "",
    status: filters.status ?? "all",
    period: filters.period ?? "all",
  };
}

function matchesWhere(row: ContactMessageRow, where: ContactMessageFilters): boolean {
  const search = where.search?.trim().toLowerCase();
  if (search) {
    const haystack = `${row.name} ${row.phone} ${row.email} ${row.number} ${row.subject}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (where.status && where.status !== "all" && row.status !== where.status) return false;

  if (where.period === "today") {
    if (row.createdAt.getTime() < startOfLocalDay().getTime()) return false;
  } else if (where.period === "week") {
    if (row.createdAt.getTime() < startOfLocalWeek().getTime()) return false;
  } else if (where.period === "month") {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (row.createdAt.getTime() < monthStart.getTime()) return false;
  }
  return true;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export async function computeStats(): Promise<ContactMessageStats> {
  const rows = await findAll<ContactMessageRow>("contactMessages");
  const todayStart = startOfLocalDay().getTime();
  let newCount = 0;
  let unread = 0;
  let replied = 0;
  let closed = 0;
  let spam = 0;
  let today = 0;
  for (const row of rows) {
    if (row.status === "NEW") newCount += 1;
    if (row.status === "NEW" || row.status === "READ") unread += 1;
    if (row.status === "REPLIED") replied += 1;
    if (row.status === "CLOSED") closed += 1;
    if (row.status === "SPAM") spam += 1;
    if (row.createdAt.getTime() >= todayStart) today += 1;
  }
  return { new: newCount, unread, replied, closed, spam, today };
}

/** List messages with search, status/period filters, sorting and pagination. */
export async function listContactMessages(
  filters: ContactMessageFilters = {}
): Promise<ContactMessageListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 24));

  const where = buildContactMessageWhere(filters);
  const rows = await findAll<ContactMessageRow>("contactMessages");
  const filtered = rows.filter((row) => matchesWhere(row, where));
  filtered.sort(SORT_ORDERS[filters.sort ?? "newest"]);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(rowToContactMessage);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    stats: await computeStats(),
  };
}

export async function getContactMessage(id: number): Promise<ContactMessageData> {
  const row = await findById<ContactMessageRow>("contactMessages", id);
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
  const previous = await findById<ContactMessageRow>("contactMessages", id);
  if (!previous) throw new ContactMessageNotFoundError(id);

  const data: Record<string, unknown> = { status };
  const now = new Date();
  if (status === "REPLIED" && !previous.repliedAt) data.repliedAt = now;
  if (status === "CLOSED" && !previous.closedAt) data.closedAt = now;

  const row = await updateDoc<ContactMessageRow>("contactMessages", id, data);
  if (!row) throw new ContactMessageNotFoundError(id);
  return rowToContactMessage(row);
}

/** Replace the admin-only internal notes. */
export async function updateContactMessageNotes(
  id: number,
  notes: string
): Promise<ContactMessageData> {
  const previous = await findById<ContactMessageRow>("contactMessages", id);
  if (!previous) throw new ContactMessageNotFoundError(id);
  const row = await updateDoc<ContactMessageRow>("contactMessages", id, { notes: notes.trim() });
  if (!row) throw new ContactMessageNotFoundError(id);
  return rowToContactMessage(row);
}

export async function deleteContactMessage(id: number): Promise<void> {
  const previous = await findById<ContactMessageRow>("contactMessages", id);
  if (!previous) throw new ContactMessageNotFoundError(id);
  await deleteDoc("contactMessages", id);
}
