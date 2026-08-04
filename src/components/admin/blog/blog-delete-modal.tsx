"use client";

import { AlertCircleIcon, TrashIcon } from "@/components/ui/icons";
import type { BlogData } from "@/lib/blog/types";

interface BlogDeleteModalProps {
  item: BlogData;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BlogDeleteModal({ item, deleting, onCancel, onConfirm }: BlogDeleteModalProps) {
  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Delete blog post"
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
                  Delete post?
                </h2>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  This article will be permanently removed from the blog, including its page URL.
                  Any cover image uploaded for it is deleted too. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] p-4">
              <p className="text-[0.82rem] font-semibold text-[var(--admin-fg)]">{item.title}</p>
              <p className="mt-2 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                {item.excerpt || "No excerpt."}
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
                  Delete post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
