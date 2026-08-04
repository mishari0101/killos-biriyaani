import type { ReservationModel } from "@/generated/prisma/models/Reservation";

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export function isReservationStatus(value: string): value is ReservationStatus {
  return (RESERVATION_STATUSES as readonly string[]).includes(value);
}

/** Wire shape returned by the API and used by the reservations manager. */
export interface ReservationData {
  id: number;
  number: string;
  name: string;
  phone: string;
  email: string;
  branch: string;
  guests: number;
  date: string;
  time: string;
  occasion: string;
  request: string;
  status: ReservationStatus;
  notes: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Raw row as stored by Prisma. */
export type ReservationRow = ReservationModel;

export type ReservationStatusFilter = "all" | ReservationStatus;
export type ReservationPeriodFilter = "all" | "today" | "upcoming" | "past";
export type ReservationSortKey = "newest" | "oldest" | "date" | "guests";

export interface ReservationFilters {
  search?: string;
  status?: ReservationStatusFilter;
  period?: ReservationPeriodFilter;
  sort?: ReservationSortKey;
  page?: number;
  pageSize?: number;
}

/** Counts shown on the dashboard cards, always over the full dataset. */
export interface ReservationStats {
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  upcoming: number;
}

export interface ReservationListResult {
  items: ReservationData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: ReservationStats;
}
