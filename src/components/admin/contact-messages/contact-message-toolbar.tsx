"use client";

import { RefreshIcon, SearchIcon } from "@/components/ui/icons";
import type {
  ContactMessagePeriodFilter,
  ContactMessageSortKey,
  ContactMessageStatusFilter,
} from "@/lib/contact-messages/types";

interface ContactMessageToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  status: ContactMessageStatusFilter;
  onStatus: (value: ContactMessageStatusFilter) => void;
  period: ContactMessagePeriodFilter;
  onPeriod: (value: ContactMessagePeriodFilter) => void;
  sort: ContactMessageSortKey;
  onSort: (value: ContactMessageSortKey) => void;
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

export function ContactMessageToolbar({
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
}: ContactMessageToolbarProps) {
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
              placeholder="Search by name, phone, email, number or subject…"
              aria-label="Search messages"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} message${total === 1 ? "" : "s"}`}
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
              onChange={(e) => onStatus(e.target.value as ContactMessageStatusFilter)}
              className="admin-input cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="CLOSED">Closed</option>
              <option value="SPAM">Spam</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Received</span>
            <select
              value={period}
              onChange={(e) => onPeriod(e.target.value as ContactMessagePeriodFilter)}
              className="admin-input cursor-pointer"
              aria-label="Filter by received date"
            >
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as ContactMessageSortKey)}
              className="admin-input cursor-pointer"
              aria-label="Sort messages"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Tip</span>
            <span className="admin-input flex items-center bg-[var(--admin-field-bg)] text-[0.78rem] text-[var(--admin-fg-muted)]">
              Open a message to read the full enquiry, then reply or close it.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
