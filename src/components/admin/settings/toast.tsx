"use client";

import { useEffect } from "react";
import { CheckCircleIcon, AlertCircleIcon, CloseIcon } from "@/components/ui/icons";

export interface ToastState {
  type: "success" | "error";
  message: string;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="admin-toast fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-3 px-4 py-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
          isSuccess ? "bg-[var(--accent)]" : "bg-[var(--brand-cta)]"
        }`}
      >
        {isSuccess ? <CheckCircleIcon size={15} /> : <AlertCircleIcon size={15} />}
      </span>
      <p className="min-w-0 flex-1 text-[0.82rem] leading-snug text-[var(--admin-fg)]">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--admin-fg-muted)] transition-colors hover:text-[var(--admin-fg)]"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
