"use client";

import { AlertCircleIcon, TrashIcon } from "@/components/ui/icons";
import type { ReviewData } from "@/lib/reviews/types";

interface ReviewDeleteModalProps {
  item: ReviewData;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReviewDeleteModal({ item, deleting, onCancel, onConfirm }: ReviewDeleteModalProps) {
  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Delete ${item.name}'s review`}
    >
      <div className="w-full max-w-md">
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-6 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--brand-cta)]/25 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]">
                <AlertCircleIcon size={20} />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
                  Delete review?
                </h2>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  The review from{" "}
                  <strong className="font-semibold text-[var(--admin-fg)]">{item.name}</strong>{" "}
                  and any uploaded photo will be permanently removed from the site. This cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[0.75rem] font-bold text-[var(--accent)]">
                  {item.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w.charAt(0).toUpperCase())
                    .join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.82rem] font-semibold text-[var(--admin-fg)]">
                    {item.name}
                  </p>
                  <p className="flex items-center gap-1 text-[0.72rem] text-[var(--accent)]">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                {item.text || "No review text."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4 sm:px-7">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="admin-btn admin-btn-ghost disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="admin-btn admin-btn-danger font-semibold disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deleting…
                </>
              ) : (
                <>
                  <TrashIcon size={15} />
                  Delete review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
