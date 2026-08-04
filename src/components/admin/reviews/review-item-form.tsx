"use client";

import { useCallback, useRef, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import { Field } from "@/components/admin/settings/field";
import { ImageUpload } from "@/components/admin/image-upload";
import { RatingSelector } from "./rating-selector";
import { deleteUploadedFile } from "@/lib/uploads/client";
import type { ReviewData } from "@/lib/reviews/types";
import {
  validateReview,
  type ReviewErrors,
  type ReviewInput,
} from "@/lib/reviews/validate";

interface ReviewItemFormProps {
  mode: "create" | "edit";
  item: ReviewData | null;
  onClose: () => void;
  onSave: (input: ReviewInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

const emptyForm: ReviewInput = {
  name: "",
  imageUrl: "",
  rating: 5,
  text: "",
  reviewDate: "Verified review",
  displayOrder: 0,
  featured: false,
  visible: true,
};

function toForm(item: ReviewData | null): ReviewInput {
  if (!item) return { ...emptyForm };
  return {
    name: item.name,
    imageUrl: item.imageUrl,
    rating: item.rating,
    text: item.text,
    reviewDate: item.reviewDate,
    displayOrder: item.displayOrder,
    featured: item.featured,
    visible: item.visible,
  };
}

export function ReviewItemForm({ mode, item, onClose, onSave }: ReviewItemFormProps) {
  const [form, setForm] = useState<ReviewInput>(() => toForm(item));
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const pendingKeyRef = useRef<string | null>(null);

  const handlePendingKeyChange = useCallback((key: string | null) => {
    pendingKeyRef.current = key;
  }, []);

  const handleClose = useCallback(() => {
    const pending = pendingKeyRef.current;
    pendingKeyRef.current = null;
    if (pending) void deleteUploadedFile(pending);
    onClose();
  }, [onClose]);

  const patch = useCallback(<K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (saving) return;
    const nextErrors = validateReview(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as ReviewErrors);
        setServerError(result.error ?? null);
      } else if (result.error) {
        setServerError(result.error);
      } else {
        pendingKeyRef.current = null;
      }
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [form, saving, onSave]);

  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "edit" ? "Edit review" : "Add review"}
    >
      <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit review" : "New review"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? item?.name ?? "Edit review" : "Add customer review"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="admin-icon-btn flex h-9 w-9 items-center justify-center"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="px-6 py-6 sm:px-7">
            <div className="admin-field-grid">
              <div className="sm:col-span-2">
                <TextInput
                  id="review-name"
                  label="Customer Name"
                  value={form.name}
                  onChange={(v) => patch("name", v)}
                  placeholder="Sarah Mitchell"
                  maxLength={120}
                  error={showErrors ? errors.name : undefined}
                  hint="Required — shown on the review card."
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Customer Photo"
                  hint="Optional — a square JPG, PNG, or WebP (max 5 MB). Skip to show the customer's initials."
                  error={showErrors ? errors.imageUrl : undefined}
                  htmlFor="review-image"
                >
                  <ImageUpload
                    value={form.imageUrl}
                    folder="reviews"
                    onChange={(url) => patch("imageUrl", url)}
                    onPendingKeyChange={handlePendingKeyChange}
                    error={showErrors ? errors.imageUrl : undefined}
                    aspect="1 / 1"
                    altLabel="Customer photo preview"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Rating"
                  hint="Tap to set the number of stars (1–5)."
                  error={showErrors ? errors.rating : undefined}
                  htmlFor="review-rating"
                >
                  <RatingSelector
                    value={form.rating}
                    onChange={(v) => patch("rating", v)}
                    error={showErrors ? errors.rating : undefined}
                  />
                </Field>
              </div>

              <div>
                <TextInput
                  id="review-date"
                  label="Review Date"
                  value={form.reviewDate}
                  onChange={(v) => patch("reviewDate", v)}
                  placeholder="2 weeks ago"
                  maxLength={120}
                  error={showErrors ? errors.reviewDate : undefined}
                  hint="Free-text label shown under the name."
                />
              </div>

              <div>
                <TextInput
                  id="review-order"
                  label="Display Order"
                  type="number"
                  inputMode="numeric"
                  value={form.displayOrder === 0 ? "0" : String(form.displayOrder)}
                  onChange={(v) => patch("displayOrder", Number(v))}
                  error={showErrors ? errors.displayOrder : undefined}
                  hint="Lower numbers appear first."
                />
              </div>
            </div>

            <div className="mt-5">
              <TextArea
                id="review-text"
                label="Review Text"
                value={form.text}
                onChange={(v) => patch("text", v)}
                placeholder="What did the guest say? Their review is shown on the site."
                maxLength={5000}
                rows={4}
                error={showErrors ? errors.text : undefined}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Visible</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Shown in the site&rsquo;s reviews section.
                  </span>
                </div>
                <Toggle
                  checked={form.visible}
                  onChange={(v) => patch("visible", v)}
                  label="Visible"
                  id="review-visible"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Featured</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Always appears first in the reviews section.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="review-featured"
                />
              </div>
            </div>

            {serverError && (
              <p
                className="mt-4 rounded-xl border border-[var(--brand-cta)]/30 bg-[var(--brand-cta)]/10 px-4 py-3 text-[0.8rem] text-[var(--brand-cta-strong)]"
                role="alert"
              >
                {serverError}
              </p>
            )}

            {showErrors && Object.keys(errors).length > 0 && !serverError && (
              <p className="mt-4 text-[0.8rem] text-[var(--brand-cta-strong)]" role="alert">
                Some fields need attention before saving.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4 sm:px-7">
            <button type="button" onClick={handleClose} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="admin-btn admin-btn-primary font-semibold disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a1a]/25 border-t-[#1a1a1a]" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon size={16} />
                  {mode === "edit" ? "Save changes" : "Add review"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
