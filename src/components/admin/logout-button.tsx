"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOutIcon } from "@/components/ui/icons";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className={
        compact
          ? "admin-icon-btn flex h-10 w-10 items-center justify-center"
          : "admin-btn admin-btn-ghost w-full"
      }
    >
      <LogOutIcon size={18} />
      {!compact && <span>{pending ? "Signing out…" : "Sign out"}</span>}
    </button>
  );
}
