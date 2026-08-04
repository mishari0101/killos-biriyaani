"use client";

import {
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type {
  ReservationData,
  ReservationStatus,
} from "@/lib/reservations/types";

const STATUS_META: Record<
  ReservationStatus,
  { label: string; pill: string }
> = {
  PENDING: {
    label: "Pending",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  CONFIRMED: {
    label: "Confirmed",
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  COMPLETED: {
    label: "Completed",
    pill: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  CANCELLED: {
    label: "Cancelled",
    pill: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
  },
  NO_SHOW: {
    label: "No show",
    pill: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
  },
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(hm: string): string {
  const [hStr, mStr] = hm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return hm;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface StatusAction {
  next: ReservationStatus;
  label: string;
  tone: string;
  icon: typeof CheckIcon;
}

function statusActions(item: ReservationData): StatusAction[] {
  if (item.status === "PENDING") {
    return [
      {
        next: "CONFIRMED",
        label: "Confirm",
        tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        icon: CheckCircleIcon,
      },
      {
        next: "NO_SHOW",
        label: "No show",
        tone: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
        icon: CloseIcon,
      },
      {
        next: "CANCELLED",
        label: "Cancel",
        tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
        icon: CloseIcon,
      },
    ];
  }
  if (item.status === "CONFIRMED") {
    return [
      {
        next: "COMPLETED",
        label: "Complete",
        tone: "border-sky-500/30 bg-sky-500/10 text-sky-600",
        icon: CheckIcon,
      },
      {
        next: "CANCELLED",
        label: "Cancel",
        tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
        icon: CloseIcon,
      },
    ];
  }
  return [];
}

interface ReservationListProps {
  items: ReservationData[];
  loading: boolean;
  onStatusChange: (item: ReservationData, status: ReservationStatus) => void;
  onEditNotes: (item: ReservationData) => void;
  onDelete: (item: ReservationData) => void;
}

export function ReservationList({
  items,
  loading,
  onStatusChange,
  onEditNotes,
  onDelete,
}: ReservationListProps) {
  return (
    <div className="admin-card relative overflow-hidden">
      <div className="admin-table-scroll overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="hidden grid-cols-[1.7fr_1.1fr_1fr_0.9fr_0.7fr_auto] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-6 py-3 lg:grid">
            <span className="admin-table-th">Reservation</span>
            <span className="admin-table-th">Contact</span>
            <span className="admin-table-th">Date &amp; time</span>
            <span className="admin-table-th">Guests</span>
            <span className="admin-table-th">Status</span>
            <span className="admin-table-th text-right">Actions</span>
          </div>

          {items.map((item) => {
            const meta = STATUS_META[item.status];
            const actions = statusActions(item);
            return (
              <div
                key={item.id}
                className="group grid grid-cols-1 gap-4 border-b border-[var(--admin-border)] px-6 py-5 last:border-b-0 lg:grid-cols-[1.7fr_1.1fr_1fr_0.9fr_0.7fr_auto] lg:items-center lg:gap-3"
              >
                {/* Reservation */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums tracking-[0.08em] text-[var(--accent)]">
                      {item.number}
                    </span>
                    <h3 className="truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
                      {item.name}
                    </h3>
                  </div>
                  {item.request ? (
                    <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                      “{item.request}”
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[0.72rem] italic text-[var(--admin-fg-muted)]">
                      No special request
                    </p>
                  )}
                  {item.notes && (
                    <p className="mt-1 text-[0.7rem] font-medium text-[var(--admin-fg-muted)]">
                      <span className="mr-1">•</span>Notes: {item.notes}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <span className="admin-table-th mb-1 block lg:hidden">Contact</span>
                  <p className="flex items-center gap-2 text-[0.82rem] text-[var(--admin-fg)]">
                    <PhoneIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {item.phone}
                  </p>
                  {item.email ? (
                    <p className="truncate text-[0.78rem] text-[var(--admin-fg-soft)]">
                      {item.email}
                    </p>
                  ) : (
                    <p className="text-[0.72rem] italic text-[var(--admin-fg-muted)]">
                      No email
                    </p>
                  )}
                </div>

                {/* Date & time */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Date &amp; time</span>
                  <p className="flex items-center gap-2 text-[0.82rem] text-[var(--admin-fg)]">
                    <CalendarIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {formatDate(item.date)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[0.78rem] text-[var(--admin-fg-soft)]">
                    <ClockIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {formatTime(item.time)}
                  </p>
                  {item.branch && (
                    <p className="mt-1 text-[0.7rem] text-[var(--admin-fg-muted)]">{item.branch}</p>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Guests</span>
                  <p className="flex items-center gap-2 text-[0.85rem] font-medium text-[var(--admin-fg)]">
                    <UsersIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {item.guests}
                  </p>
                  {item.occasion && (
                    <p className="mt-1 text-[0.7rem] text-[var(--admin-fg-muted)]">
                      {item.occasion}
                    </p>
                  )}
                  <p className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-[var(--admin-fg-muted)]">
                    <UserIcon size={11} className="shrink-0" />
                    {formatWhen(item.createdAt)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Actions */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Actions</span>
                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    {actions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.next}
                          type="button"
                          onClick={() => onStatusChange(item, action.next)}
                          aria-label={`${action.label} ${item.number}`}
                          title={action.label}
                          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-medium transition-colors ${action.tone}`}
                        >
                          <Icon size={12} />
                          {action.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => onEditNotes(item)}
                      aria-label={`Edit notes for ${item.number}`}
                      title="Internal notes"
                      className="admin-icon-btn flex h-8 w-8 items-center justify-center"
                    >
                      <PencilIcon size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      aria-label={`Delete ${item.number}`}
                      title="Delete"
                      className="admin-icon-btn flex h-8 w-8 items-center justify-center text-[var(--brand-cta)] hover:border-[var(--brand-cta)]"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-[var(--admin-bg)]/40 pt-8 backdrop-blur-[1px]">
          <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-1.5 text-[0.75rem] text-[var(--admin-fg-soft)] shadow-[var(--admin-shadow)]">
            Loading…
          </span>
        </div>
      )}
    </div>
  );
}
