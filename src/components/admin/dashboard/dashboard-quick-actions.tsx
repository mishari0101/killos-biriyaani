import Link from "next/link";
import { ArrowRightLongIcon, PlusIcon } from "@/components/ui/icons";

const QUICK_ACTIONS = [
  {
    label: "Add Menu Item",
    href: "/admin/menu",
    description: "New dish or category",
  },
  {
    label: "Add Gallery Image",
    href: "/admin/gallery",
    description: "Upload a highlight",
  },
  {
    label: "Add Attraction",
    href: "/admin/attractions",
    description: "New nearby highlight",
  },
  {
    label: "Add Review",
    href: "/admin/reviews",
    description: "Post guest feedback",
  },
  {
    label: "Add Branch",
    href: "/admin/branches",
    description: "New outlet or hours",
  },
  {
    label: "View Reservations",
    href: "/admin/reservations",
    description: "Confirm & manage bookings",
  },
  {
    label: "View Contact Messages",
    href: "/admin/contact",
    description: "Reply to enquiries",
  },
];

export function DashboardQuickActions() {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
          Quick actions
        </h2>
        <Link
          href="/admin"
          className="admin-link flex items-center gap-1.5 text-[0.8rem]"
        >
          All tools <ArrowRightLongIcon size={15} />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="admin-card group flex items-center gap-4 p-4"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--admin-border-strong)] text-[var(--admin-fg-soft)] transition-colors duration-300 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
              <PlusIcon size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.88rem] font-medium text-[var(--admin-fg)]">
                {action.label}
              </p>
              <p className="truncate text-[0.75rem] text-[var(--admin-fg-muted)]">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
