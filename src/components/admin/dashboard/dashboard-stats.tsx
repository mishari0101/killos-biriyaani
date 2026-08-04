import {
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  ImageIcon,
  MailIcon,
  MessageSquareIcon,
  StarFilledIcon,
  StarIcon,
  StoreIcon,
  TrendUpIcon,
  UtensilsIcon,
} from "@/components/ui/icons";
import type { DashboardStats } from "@/lib/dashboard/types";

interface StatDef {
  key: keyof DashboardStats;
  label: string;
  hint: string;
  icon: typeof MailIcon;
  accent?: boolean;
}

const OPERATIONS: StatDef[] = [
  {
    key: "reservationsTotal",
    label: "Total Reservations",
    hint: "All-time bookings",
    icon: CalendarDaysIcon,
    accent: true,
  },
  {
    key: "reservationsPending",
    label: "Pending Reservations",
    hint: "Awaiting confirmation",
    icon: ClockIcon,
  },
  {
    key: "reservationsToday",
    label: "Today's Reservations",
    hint: "Bookings for today",
    icon: CalendarIcon,
  },
  {
    key: "messagesTotal",
    label: "Total Contact Messages",
    hint: "All-time enquiries",
    icon: MailIcon,
  },
];

const CONTENT: StatDef[] = [
  {
    key: "messagesNew",
    label: "New Messages",
    hint: "Not yet replied",
    icon: MessageSquareIcon,
  },
  {
    key: "menuItems",
    label: "Menu Items",
    hint: "Dishes live",
    icon: UtensilsIcon,
  },
  {
    key: "galleryImages",
    label: "Gallery Images",
    hint: "Photos in grid",
    icon: ImageIcon,
  },
  {
    key: "attractions",
    label: "Attractions",
    hint: "Travel highlights",
    icon: StarIcon,
  },
  {
    key: "reviews",
    label: "Reviews",
    hint: "Guest feedback",
    icon: StarFilledIcon,
  },
  {
    key: "branches",
    label: "Branches",
    hint: "Restaurant outlets",
    icon: StoreIcon,
  },
];

function StatCard({ def, stats }: { def: StatDef; stats: DashboardStats }) {
  const Icon = def.icon;
  return (
    <div className="admin-card p-5">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            def.accent
              ? "border-[rgba(201,162,39,0.35)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              : "border-[var(--admin-border)] bg-[var(--admin-card-hover)] text-[var(--admin-fg-soft)]"
          }`}
        >
          <Icon size={19} />
        </div>
        {def.accent && (
          <span className="flex items-center gap-1 rounded-full bg-[rgba(39,174,96,0.1)] px-2 py-0.5 text-[0.62rem] font-medium text-[#27ae60]">
            <TrendUpIcon size={12} />
            Live
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-[var(--admin-fg)]">
        {stats[def.key]}
      </p>
      <p className="mt-1 text-[0.85rem] font-medium text-[var(--admin-fg-soft)]">
        {def.label}
      </p>
      <p className="mt-0.5 text-[0.72rem] text-[var(--admin-fg-muted)]">{def.hint}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
      {children}
    </h2>
  );
}

export function DashboardStats({ stats }: { stats: DashboardStats }) {
  return (
    <section className="space-y-6">
      <div>
        <SectionLabel>Live operations</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {OPERATIONS.map((def) => (
            <StatCard key={def.key} def={def} stats={stats} />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Content library</SectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT.map((def) => (
            <StatCard key={def.key} def={def} stats={stats} />
          ))}
        </div>
      </div>
    </section>
  );
}
