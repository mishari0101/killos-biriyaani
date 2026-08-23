"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/ui/icons";

interface NotificationItem {
  id: number;
  name: string;
  subject: string;
  createdAt: string;
}

/** Topbar bell — shows unread contact messages with a dropdown preview. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    let ignore = false;
    fetch("/api/contact-messages?status=NEW&pageSize=6", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setItems(Array.isArray(res.items) ? res.items : []);
          setTotal(typeof res.total === "number" ? res.total : 0);
          setLoaded(true);
        }
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={total > 0 ? `${total} new message${total === 1 ? "" : "s"}` : "Notifications"}
        aria-expanded={open}
        className={`admin-icon-btn relative flex h-10 w-10 cursor-pointer items-center justify-center ${
          open ? "!border-[var(--accent)] text-[var(--admin-fg)]" : ""
        }`}
      >
        <BellIcon size={17} />
        {loaded && total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[var(--brand-cta)] px-1 text-[0.62rem] font-semibold leading-none text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="admin-card absolute right-0 top-12 z-50 w-80 overflow-hidden !rounded-xl p-0">
          <p className="px-4 pb-2 pt-3.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
            New messages
          </p>
          <div className="admin-divider" />
          {items.length === 0 ? (
            <p className="px-4 py-5 text-[0.82rem] text-[var(--admin-fg-muted)]">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href="/admin/contact"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-[var(--admin-nav-active-bg)]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[0.82rem] font-medium text-[var(--admin-fg)]">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-[0.68rem] text-[var(--admin-fg-muted)]">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[0.75rem] text-[var(--admin-fg-soft)]">
                      {item.subject || item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="admin-divider" />
          <Link
            href="/admin/contact"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-[0.78rem] font-medium text-[var(--accent-strong)] transition-colors hover:bg-[var(--admin-nav-active-bg)]"
          >
            Open inbox
          </Link>
        </div>
      )}
    </div>
  );
}
