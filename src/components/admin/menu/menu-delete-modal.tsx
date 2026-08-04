"use client";

import { AlertCircleIcon, TrashIcon } from "@/components/ui/icons";
import type { MenuItemData } from "@/lib/menu/types";

interface MenuDeleteModalProps {
  item: MenuItemData;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MenuDeleteModal({ item, deleting, onCancel, onConfirm }: MenuDeleteModalProps) {
  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Delete ${item.name}`}
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
                  Delete menu item?
                </h2>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  <strong className="font-semibold text-[var(--admin-fg)]">{item.name}</strong>{" "}
                  will be permanently removed from the menu. This cannot be undone.
                </p>
              </div>
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
                  Delete item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
