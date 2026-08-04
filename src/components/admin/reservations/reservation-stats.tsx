"use client";

import {
  CalendarDaysIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
} from "@/components/ui/icons";
import type { ReservationStats } from "@/lib/reservations/types";

const CARD_DEFS: {
  key: keyof ReservationStats;
  label: string;
  icon: typeof CalendarIcon;
  tone: string;
  iconWrap: string;
}[] = [
  {
    key: "today",
    label: "Today's Reservations",
    icon: CalendarIcon,
    tone: "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]",
    iconWrap: "bg-[var(--accent)]/10 text-[var(--accent)]",
  },
  {
    key: "pending",
    label: "Pending",
    icon: ClockIcon,
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    iconWrap: "bg-amber-500/10 text-amber-600",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircleIcon,
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    iconWrap: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckIcon,
    tone: "border-sky-500/40 bg-sky-500/10 text-sky-600",
    iconWrap: "bg-sky-500/10 text-sky-600",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: CloseIcon,
    tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
    iconWrap: "bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: CalendarDaysIcon,
    tone: "border-violet-500/40 bg-violet-500/10 text-violet-600",
    iconWrap: "bg-violet-500/10 text-violet-600",
  },
];

interface ReservationStatsProps {
  stats: ReservationStats;
}

export function ReservationStatsCards({ stats }: ReservationStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {CARD_DEFS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="admin-card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconWrap}`}
                >
                  <Icon size={18} />
                </span>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] ${card.tone}`}
                >
                  {card.label}
                </span>
              </div>
              <p className="mt-4 font-serif text-3xl font-semibold tabular-nums text-[var(--admin-fg)]">
                {stats[card.key]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
