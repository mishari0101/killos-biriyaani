import type { ContactMessageModel } from "@/generated/prisma/models/ContactMessage";

export const CONTACT_MESSAGE_STATUSES = [
  "NEW",
  "READ",
  "REPLIED",
  "CLOSED",
  "SPAM",
] as const;

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export function isContactMessageStatus(value: string): value is ContactMessageStatus {
  return (CONTACT_MESSAGE_STATUSES as readonly string[]).includes(value);
}

/** Wire shape returned by the API and used by the contact manager. */
export interface ContactMessageData {
  id: number;
  number: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  branch: string;
  status: ContactMessageStatus;
  notes: string;
  repliedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type ContactMessageRow = ContactMessageModel;

export type ContactMessageStatusFilter = "all" | ContactMessageStatus;
export type ContactMessagePeriodFilter = "all" | "today" | "week" | "month";
export type ContactMessageSortKey = "newest" | "oldest" | "name" | "status";

export interface ContactMessageFilters {
  search?: string;
  status?: ContactMessageStatusFilter;
  period?: ContactMessagePeriodFilter;
  sort?: ContactMessageSortKey;
  page?: number;
  pageSize?: number;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export interface ContactMessageStats {
  new: number;
  unread: number;
  replied: number;
  closed: number;
  spam: number;
  today: number;
}

export interface ContactMessageListResult {
  items: ContactMessageData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: ContactMessageStats;
}
