"use client";

import { useState } from "react";
import { SaveIcon } from "@/components/ui/icons";
import type { ReservationData } from "@/lib/reservations/types";
import { MAX_NOTES } from "@/lib/reservations/validate";

interface ReservationNotesModalProps {
  item: ReservationData;
  saving: boolean;
  onCancel: () => void;
  onSave: (notes: string) => void;
}

export function ReservationNotesModal({
  item,
  saving,
  onCancel,
  onSave,
}: ReservationNotesModalProps) {
  const [notes, setNotes] = useState(item.notes);

  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Internal notes for ${item.number}`}
    >
      <div className="w-full max-w-lg">
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
                  Internal notes
                </h2>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  <strong className="font-semibold text-[var(--admin-fg)]">{item.number}</strong>{" "}
                  — {item.name} · {item.guests} guests on {item.date} at {item.time}. These notes
                  are only visible to staff.
                </p>
              </div>
              <span className="inline-flex shrink-0 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums tracking-[0.08em] text-[var(--accent)]">
                {item.number}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label htmlFor="reservation-notes" className="admin-field-label">
                Notes
              </label>
              <textarea
                id="reservation-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the team should know — table preference, allergies, VIP…"
                maxLength={MAX_NOTES}
                rows={5}
                autoFocus
                className="admin-input resize-y"
              />
              <span className="admin-char-count text-right">
                {notes.length}/{MAX_NOTES}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4 sm:px-7">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="admin-btn admin-btn-ghost disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(notes)}
              disabled={saving}
              className="admin-btn admin-btn-primary font-semibold disabled:opacity-60"
            >
              <SaveIcon size={15} />
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
