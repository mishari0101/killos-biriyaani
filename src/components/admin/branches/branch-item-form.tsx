"use client";

import { useCallback, useRef, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import { Field } from "@/components/admin/settings/field";
import { ImageUpload } from "@/components/admin/image-upload";
import { BranchHoursEditor } from "./branch-hours-editor";
import { deleteUploadedFile } from "@/lib/uploads/client";
import { defaultBranchHours, validateBranch, type BranchErrors, type BranchInput } from "@/lib/branches/validate";
import type { BranchData } from "@/lib/branches/types";

interface BranchItemFormProps {
  mode: "create" | "edit";
  item: BranchData | null;
  onClose: () => void;
  onSave: (input: BranchInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

function toForm(item: BranchData | null): BranchInput {
  if (!item) {
    return {
      name: "",
      imageUrl: "",
      address: "",
      mapsUrl: "",
      latitude: 0,
      longitude: 0,
      primaryPhone: "",
      secondaryPhone: "",
      whatsapp: "",
      email: "",
      hours: defaultBranchHours(),
      description: "",
      displayOrder: 0,
      featured: false,
      visible: true,
    };
  }
  return {
    name: item.name,
    imageUrl: item.imageUrl,
    address: item.address,
    mapsUrl: item.mapsUrl,
    latitude: item.latitude,
    longitude: item.longitude,
    primaryPhone: item.primaryPhone,
    secondaryPhone: item.secondaryPhone,
    whatsapp: item.whatsapp,
    email: item.email,
    hours: item.hours,
    description: item.description,
    displayOrder: item.displayOrder,
    featured: item.featured,
    visible: item.visible,
  };
}

export function BranchItemForm({ mode, item, onClose, onSave }: BranchItemFormProps) {
  const [form, setForm] = useState<BranchInput>(() => toForm(item));
  const [errors, setErrors] = useState<BranchErrors>({});
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

  const patch = useCallback(<K extends keyof BranchInput>(key: K, value: BranchInput[K]) => {
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
    const nextErrors = validateBranch(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as BranchErrors);
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
      aria-label={mode === "edit" ? "Edit branch" : "Add branch"}
    >
      <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit branch" : "New branch"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? item?.name ?? "Edit branch" : "Add a branch"}
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
                  id="branch-name"
                  label="Branch Name"
                  value={form.name}
                  onChange={(v) => patch("name", v)}
                  placeholder="Killo's Biriyani — Mavadichenai"
                  maxLength={160}
                  error={showErrors ? errors.name : undefined}
                  hint="Required — shown on the branch cards and in the address bar."
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Branch Photo"
                  hint="Optional — a JPG, PNG, or WebP (max 5 MB)."
                  error={showErrors ? errors.imageUrl : undefined}
                  htmlFor="branch-image"
                >
                  <ImageUpload
                    value={form.imageUrl}
                    folder="branches"
                    onChange={(url) => patch("imageUrl", url)}
                    onPendingKeyChange={handlePendingKeyChange}
                    error={showErrors ? errors.imageUrl : undefined}
                    aspect="4 / 3"
                    altLabel="Branch photo preview"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <TextInput
                  id="branch-address"
                  label="Address"
                  value={form.address}
                  onChange={(v) => patch("address", v)}
                  placeholder="Main Street, Mavadichenai, Valaichenai"
                  maxLength={500}
                  error={showErrors ? errors.address : undefined}
                  hint="Required — shown on the cards, contact section and footer."
                />
              </div>

              <div className="sm:col-span-2">
                <TextInput
                  id="branch-maps"
                  label="Google Maps Link"
                  value={form.mapsUrl}
                  onChange={(v) => patch("mapsUrl", v)}
                  placeholder="https://maps.app.goo.gl/…"
                  maxLength={1000}
                  error={showErrors ? errors.mapsUrl : undefined}
                  hint="Required — the link opened when guests tap directions."
                />
              </div>

              <TextInput
                id="branch-lat"
                label="Latitude"
                type="number"
                inputMode="decimal"
                step="any"
                value={form.latitude === 0 ? "0" : String(form.latitude)}
                onChange={(v) => patch("latitude", Number(v) || 0)}
                error={showErrors ? errors.latitude : undefined}
                hint="Used to pin the map."
              />

              <TextInput
                id="branch-lng"
                label="Longitude"
                type="number"
                inputMode="decimal"
                step="any"
                value={form.longitude === 0 ? "0" : String(form.longitude)}
                onChange={(v) => patch("longitude", Number(v) || 0)}
                error={showErrors ? errors.longitude : undefined}
                hint="Used to pin the map."
              />

              <TextInput
                id="branch-phone-primary"
                label="Primary Phone"
                type="tel"
                inputMode="tel"
                value={form.primaryPhone}
                onChange={(v) => patch("primaryPhone", v)}
                placeholder="+94 XX XXX XXXX"
                maxLength={40}
                error={showErrors ? errors.primaryPhone : undefined}
                hint="Required — the main call button."
              />

              <TextInput
                id="branch-phone-secondary"
                label="Secondary Phone"
                type="tel"
                inputMode="tel"
                value={form.secondaryPhone}
                onChange={(v) => patch("secondaryPhone", v)}
                placeholder="+94 XX XXX XXXX"
                maxLength={40}
                error={showErrors ? errors.secondaryPhone : undefined}
                hint="Optional — shown alongside the primary number."
              />

              <TextInput
                id="branch-whatsapp"
                label="WhatsApp Number"
                type="tel"
                inputMode="tel"
                value={form.whatsapp}
                onChange={(v) => patch("whatsapp", v)}
                placeholder="07X XXX XXXX"
                maxLength={40}
                error={showErrors ? errors.whatsapp : undefined}
                hint="Optional — drives the WhatsApp buttons across the site."
              />

              <TextInput
                id="branch-email"
                label="Email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(v) => patch("email", v)}
                placeholder="name@example.com"
                maxLength={160}
                error={showErrors ? errors.email : undefined}
                hint="Optional — used for contact enquiries."
              />

              <div className="sm:col-span-2">
                <Field
                  label="Opening Hours"
                  hint="Per-day opening and closing times (Mon–Sun)."
                  error={showErrors ? errors.hours : undefined}
                  htmlFor="branch-hours"
                >
                  <BranchHoursEditor
                    value={form.hours}
                    onChange={(v) => patch("hours", v)}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <TextArea
                  id="branch-description"
                  label="Description"
                  value={form.description}
                  onChange={(v) => patch("description", v)}
                  placeholder="Short note about this branch (optional)."
                  maxLength={2000}
                  rows={3}
                  error={showErrors ? errors.description : undefined}
                />
              </div>

              <TextInput
                id="branch-order"
                label="Display Order"
                type="number"
                inputMode="numeric"
                value={form.displayOrder === 0 ? "0" : String(form.displayOrder)}
                onChange={(v) => patch("displayOrder", Number(v))}
                error={showErrors ? errors.displayOrder : undefined}
                hint="Lower numbers appear first."
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Visible</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Shown on the branches, location, contact and footer sections.
                  </span>
                </div>
                <Toggle
                  checked={form.visible}
                  onChange={(v) => patch("visible", v)}
                  label="Visible"
                  id="branch-visible"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">
                    Head Branch
                  </span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Appears first and drives the contact details across the site.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="branch-featured"
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
                  {mode === "edit" ? "Save changes" : "Add branch"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
