"use client";

import { useEffect, useCallback, useState } from "react";
import { AdminSidebarContent } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import type { SessionPayload } from "@/lib/auth/jwt";

interface AdminShellProps {
  user: SessionPayload;
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="admin-body flex min-h-screen">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:block">
        <AdminSidebarContent />
      </aside>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="admin-scrim absolute inset-0 cursor-pointer"
          />
          <aside className="admin-sidebar absolute inset-y-0 left-0 w-72 border-r shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              className="admin-icon-btn absolute right-3 top-4 flex h-10 w-10 items-center justify-center"
            >
              <CloseIcon size={18} />
            </button>
            <AdminSidebarContent onNavigate={closeDrawer} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="admin-topbar sticky top-0 z-30 border-b">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="admin-icon-btn flex h-10 w-10 items-center justify-center lg:hidden"
            >
              <MenuIcon size={19} />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-1.5 text-[0.72rem] text-[var(--admin-fg-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="hidden sm:inline">Live</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton compact />

              <div className="ml-1 hidden items-center gap-3 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] py-1.5 pl-1.5 pr-4 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[0.65rem] font-semibold text-[#1a1a1a]">
                  {initials}
                </div>
                <div className="leading-tight">
                  <p className="max-w-[10rem] truncate text-[0.8rem] font-medium text-[var(--admin-fg)]">
                    {user.name}
                  </p>
                  <p className="text-[0.62rem] text-[var(--admin-fg-muted)]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
