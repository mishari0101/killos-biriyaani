"use client";

import { useCallback, useRef, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import { Field } from "@/components/admin/settings/field";
import { GalleryImageUpload } from "./gallery-image-upload";
import { deleteUploadedFile } from "@/lib/uploads/client";
import type { GalleryItemData } from "@/lib/gallery/types";
import {
  validateGalleryItem,
  type GalleryItemErrors,
  type GalleryItemInput,
} from "@/lib/gallery/validate";

interface GalleryItemFormProps {
  mode: "create" | "edit";
  item: GalleryItemData | null;
  onClose: () => void;
  onSave: (input: GalleryItemInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

const emptyForm: GalleryItemInput = {
  title: "",
  description: "",
  imageUrl: "",
  aspect: "4 / 3",
  displayOrder: 0,
  featured: false,
  visible: true,
};

function toForm(item: GalleryItemData | null): GalleryItemInput {
  if (!item) return { ...emptyForm };
  return {
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    aspect: item.aspect,
    displayOrder: item.displayOrder,
    featured: item.featured,
    visible: item.visible,
  };
}

export function GalleryItemForm({ mode, item, onClose, onSave }: GalleryItemFormProps) {
  const [form, setForm] = useState<GalleryItemInput>(() => toForm(item));
  const [errors, setErrors] = useState<GalleryItemErrors>({});
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

  const patch = useCallback(<K extends keyof GalleryItemInput>(key: K, value: GalleryItemInput[K]) => {
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
    const nextErrors = validateGalleryItem(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as GalleryItemErrors);
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
      aria-label={mode === "edit" ? "Edit gallery photo" : "Add gallery photo"}
    >
      <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit photo" : "New photo"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? item?.title ?? "Edit photo" : "Add gallery photo"}
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
                  id="gallery-title"
                  label="Title"
                  value={form.title}
                  onChange={(v) => patch("title", v)}
                  placeholder="Signature Biriyani Platter"
                  maxLength={160}
                  error={showErrors ? errors.title : undefined}
                  hint="Required — shown on the gallery card."
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Photo"
                  hint="Choose a JPG, PNG, or WebP image (max 5 MB)."
                  error={showErrors ? errors.imageUrl : undefined}
                  htmlFor="gallery-image"
                >
                  <GalleryImageUpload
                    value={form.imageUrl}
                    aspect={form.aspect}
                    onAspectChange={(a) => patch("aspect", a)}
                    onChange={(url) => patch("imageUrl", url)}
                    onPendingKeyChange={handlePendingKeyChange}
                    error={showErrors ? errors.imageUrl : undefined}
                  />
                </Field>
              </div>

              <div>
                <TextInput
                  id="gallery-order"
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
                id="gallery-description"
                label="Description"
                value={form.description}
                onChange={(v) => patch("description", v)}
                placeholder="Optional caption shown under the photo."
                maxLength={2000}
                rows={3}
                error={showErrors ? errors.description : undefined}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Visible</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Shown on the public gallery.
                  </span>
                </div>
                <Toggle
                  checked={form.visible}
                  onChange={(v) => patch("visible", v)}
                  label="Visible"
                  id="gallery-visible"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Featured</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Appears first in the gallery.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="gallery-featured"
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
                  {mode === "edit" ? "Save changes" : "Add photo"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
