"use client";

import { AlertCircleIcon, ImageIcon, MapPinIcon, TrashIcon } from "@/components/ui/icons";
import type { AttractionData } from "@/lib/attractions/types";

interface AttractionDeleteModalProps {
  item: AttractionData;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AttractionDeleteModal({
  item,
  deleting,
  onCancel,
  onConfirm,
}: AttractionDeleteModalProps) {
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
                  Delete attraction?
                </h2>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  <strong className="font-semibold text-[var(--admin-fg)]">{item.name}</strong>{" "}
                  and its uploaded image will be permanently removed from the travel section. This
                  cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={22} className="text-[var(--admin-fg-muted)]" />
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[0.76rem] text-[var(--admin-fg-muted)]">
              <MapPinIcon size={14} className="shrink-0" />
              <span className="truncate">{item.mapUrl}</span>
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
                  Delete attraction
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
