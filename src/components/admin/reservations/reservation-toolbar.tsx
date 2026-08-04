"use client";

import { RefreshIcon, SearchIcon } from "@/components/ui/icons";
import type {
  ReservationPeriodFilter,
  ReservationSortKey,
  ReservationStatusFilter,
} from "@/lib/reservations/types";

interface ReservationToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  status: ReservationStatusFilter;
  onStatus: (value: ReservationStatusFilter) => void;
  period: ReservationPeriodFilter;
  onPeriod: (value: ReservationPeriodFilter) => void;
  sort: ReservationSortKey;
  onSort: (value: ReservationSortKey) => void;
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

export function ReservationToolbar({
  search,
  onSearch,
  status,
  onStatus,
  period,
  onPeriod,
  sort,
  onSort,
  total,
  loading,
  onRefresh,
}: ReservationToolbarProps) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name, phone, email or number…"
              aria-label="Search reservations"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} reservation${total === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="admin-btn admin-btn-ghost"
              disabled={loading}
            >
              <RefreshIcon size={15} />
              Refresh
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Status</span>
            <select
              value={status}
              onChange={(e) => onStatus(e.target.value as ReservationStatusFilter)}
              className="admin-input cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No show</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">When</span>
            <select
              value={period}
              onChange={(e) => onPeriod(e.target.value as ReservationPeriodFilter)}
              className="admin-input cursor-pointer"
              aria-label="Filter by date period"
            >
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as ReservationSortKey)}
              className="admin-input cursor-pointer"
              aria-label="Sort reservations"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="date">Reservation date</option>
              <option value="guests">Guests</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Tip</span>
            <span className="admin-input flex items-center bg-[var(--admin-field-bg)] text-[0.78rem] text-[var(--admin-fg-muted)]">
              Use actions on each row to confirm, complete or cancel a booking.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
