"use client";

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  MailIcon,
} from "@/components/ui/icons";
import type { ContactMessageStats } from "@/lib/contact-messages/types";

const CARD_DEFS: {
  key: keyof ContactMessageStats;
  label: string;
  icon: typeof MailIcon;
  tone: string;
  iconWrap: string;
}[] = [
  {
    key: "new",
    label: "New Messages",
    icon: MailIcon,
    tone: "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]",
    iconWrap: "bg-[var(--accent)]/10 text-[var(--accent)]",
  },
  {
    key: "unread",
    label: "Unread",
    icon: ClockIcon,
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    iconWrap: "bg-amber-500/10 text-amber-600",
  },
  {
    key: "replied",
    label: "Replied",
    icon: CheckCircleIcon,
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    iconWrap: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "closed",
    label: "Closed",
    icon: CheckIcon,
    tone: "border-sky-500/40 bg-sky-500/10 text-sky-600",
    iconWrap: "bg-sky-500/10 text-sky-600",
  },
  {
    key: "spam",
    label: "Spam",
    icon: CloseIcon,
    tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
    iconWrap: "bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
  },
  {
    key: "today",
    label: "Today's Messages",
    icon: CalendarDaysIcon,
    tone: "border-violet-500/40 bg-violet-500/10 text-violet-600",
    iconWrap: "bg-violet-500/10 text-violet-600",
  },
];

interface ContactMessageStatsProps {
  stats: ContactMessageStats;
}

export function ContactMessageStatsCards({ stats }: ContactMessageStatsProps) {
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
