import { CalendarDaysIcon, MailIcon } from "@/components/ui/icons";
import type { RecentActivityItem } from "@/lib/dashboard/types";

const RESERVATION_STATUS_PILL: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  COMPLETED: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  CANCELLED: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
  NO_SHOW: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
};

const MESSAGE_STATUS_PILL: Record<string, string> = {
  NEW: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  READ: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  REPLIED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  CLOSED: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
  SPAM: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
};

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  CLOSED: "Closed",
  SPAM: "Spam",
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatRelative(iso: string, now: Date): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;

  const diffSec = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24 && startOfDay(then).getTime() === startOfDay(now).getTime()) {
    return `${diffHr}h ago`;
  }
  const dayDiff = Math.round(
    (startOfDay(now).getTime() - startOfDay(then).getTime()) / 86400000
  );
  if (dayDiff === 1) return "Yesterday";
  return then.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

interface DashboardRecentProps {
  items: RecentActivityItem[];
  now: number;
}

export function DashboardRecent({ items, now }: DashboardRecentProps) {
  const nowDate = new Date(now);
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
          Recent activity
        </h2>
        <span className="admin-chip">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          Live
        </span>
      </div>
      <div className="mt-4 divide-y divide-[var(--admin-border)] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[var(--admin-shadow)]">
        {items.length === 0 ? (
          <div className="p-6 text-[0.85rem] text-[var(--admin-fg-muted)]">
            No activity yet. New reservations and messages will appear here
            instantly.
          </div>
        ) : (
          items.map((item) => {
            const isReservation = item.kind === "reservation";
            const Icon = isReservation ? CalendarDaysIcon : MailIcon;
            const pill = isReservation
              ? RESERVATION_STATUS_PILL[item.status] ?? RESERVATION_STATUS_PILL.PENDING
              : MESSAGE_STATUS_PILL[item.status] ?? MESSAGE_STATUS_PILL.NEW;
            const label = isReservation
              ? RESERVATION_STATUS_LABEL[item.status] ?? item.status
              : MESSAGE_STATUS_LABEL[item.status] ?? item.status;
            const kindText = isReservation
              ? `Reservation ${item.number}`
              : `Message ${item.number}`;
            return (
              <div key={`${item.kind}-${item.id}`} className="flex items-start gap-4 p-5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-hover)] text-[var(--admin-fg-soft)]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9rem] font-medium text-[var(--admin-fg)]">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[0.82rem] leading-relaxed text-[var(--admin-fg-soft)]">
                    {kindText}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
                    {formatRelative(item.createdAt, nowDate)}
                  </p>
                </div>
                <span
                  className={`mt-0.5 inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${pill}`}
                >
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
