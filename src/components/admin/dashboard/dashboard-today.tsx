import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  MessageSquareIcon,
} from "@/components/ui/icons";
import type { TodaySummary } from "@/lib/dashboard/types";

interface TodayTile {
  key: keyof TodaySummary;
  label: string;
  icon: typeof CalendarIcon;
}

const TILES: TodayTile[] = [
  { key: "reservationsToday", label: "Today's Reservations", icon: CalendarIcon },
  { key: "messagesToday", label: "Today's Messages", icon: MailIcon },
  { key: "pendingReservations", label: "Pending Reservations", icon: ClockIcon },
  { key: "unreadMessages", label: "Unread Messages", icon: MessageSquareIcon },
];

export function DashboardToday({ today }: { today: TodaySummary }) {
  return (
    <section className="admin-card mt-10 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 sm:px-7">
        <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
          Today at a glance
        </h2>
        <span className="admin-chip">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          Real time
        </span>
      </div>
      <div className="mt-5 grid grid-cols-1 divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.key} className="flex items-center gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(201,162,39,0.35)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-serif text-2xl font-semibold tabular-nums leading-none text-[var(--admin-fg)]">
                  {today[tile.key]}
                </p>
                <p className="mt-1.5 truncate text-[0.75rem] font-medium text-[var(--admin-fg-muted)]">
                  {tile.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
