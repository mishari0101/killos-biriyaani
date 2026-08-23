"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";

/** Global admin search — Enter jumps to the Menu Items page pre-filtered. */
export function TopbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (q) router.push(`/admin/menu?search=${encodeURIComponent(q)}`);
      }}
      className="relative hidden md:block"
    >
      <SearchIcon
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search menu items…"
        aria-label="Search menu items"
        className="admin-input !w-64 !rounded-full !py-2.5 pl-10 pr-14 text-[0.82rem]"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border)] px-1.5 py-0.5 text-[0.65rem] font-medium text-[var(--admin-fg-muted)] lg:block">
        ⌘K
      </kbd>
    </form>
  );
}
