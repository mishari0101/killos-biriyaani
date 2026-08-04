"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavSections } from "@/lib/admin/nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { ArrowRightIcon } from "@/components/ui/icons";

export function AdminSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] font-serif text-lg font-semibold text-[#1a1a1a] shadow-[0_10px_24px_-10px_rgba(201,162,39,0.7)]">
          K
        </div>
        <div className="leading-tight">
          <p className="font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
            Killo&rsquo;s Biriyani
          </p>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--admin-fg-muted)]">
            Admin Studio
          </p>
        </div>
      </div>

      <div className="admin-rule-gold mx-5" />

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {adminNavSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={`admin-nav-link relative flex items-center gap-3 px-3 py-2.5 text-[0.85rem] font-medium ${
                        isActive ? "is-active" : ""
                      }`}
                    >
                      <span className="admin-nav-dot absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                      <item.icon size={18} />
                      <span className="flex-1">{item.label}</span>
                      {item.status === "planned" && (
                        <span className="rounded-full border border-[var(--admin-border)] px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-[var(--admin-fg-muted)]">
                          Soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--admin-border)] p-3">
        <Link
          href="/"
          className="admin-btn admin-btn-ghost mb-2 w-full"
        >
          <ArrowRightIcon size={17} className="rotate-180" />
          <span>View site</span>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
