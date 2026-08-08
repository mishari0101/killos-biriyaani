"use client";

import { useCallback, useRef, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import { Field } from "@/components/admin/settings/field";
import { ImageUpload } from "./image-upload";
import { MenuCategoryModal } from "./menu-category-modal";
import { deleteUploadedFile } from "@/lib/uploads/client";
import type { MenuCategoryData, MenuItemData } from "@/lib/menu/types";
import { validateMenuItem, type MenuItemInput, type MenuItemErrors } from "@/lib/menu/validate";

interface MenuItemFormProps {
  mode: "create" | "edit";
  item: MenuItemData | null;
  categories: string[];
  onClose: () => void;
  onSave: (input: MenuItemInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

const emptyForm: MenuItemInput = {
  category: "",
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  available: true,
  featured: false,
  displayOrder: 0,
};

function toForm(item: MenuItemData | null): MenuItemInput {
  if (!item) return { ...emptyForm };
  return {
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    available: item.available,
    featured: item.featured,
    displayOrder: item.displayOrder,
  };
}

export function MenuItemForm({ mode, item, categories, onClose, onSave }: MenuItemFormProps) {
  const [form, setForm] = useState<MenuItemInput>(() => toForm(item));
  const [errors, setErrors] = useState<MenuItemErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => [...categories].sort());
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
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

  const patch = useCallback(<K extends keyof MenuItemInput>(key: K, value: MenuItemInput[K]) => {
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
    const nextErrors = validateMenuItem(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as MenuItemErrors);
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
      aria-label={mode === "edit" ? "Edit menu item" : "Add menu item"}
    >
      <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit item" : "New item"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? item?.name ?? "Edit item" : "Add menu item"}
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
                  id="menu-name"
                  label="Item Name"
                  value={form.name}
                  onChange={(v) => patch("name", v)}
                  placeholder="Chicken Biriyani"
                  maxLength={160}
                  error={showErrors ? errors.name : undefined}
                  hint="Required — the dish name shown on the site."
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Category"
                  hint="Pick an existing category or create a new one."
                  error={showErrors ? errors.category : undefined}
                  htmlFor="menu-category"
                >
                  <select
                    id="menu-category"
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === "__create_new__") {
                        setCategoryModalOpen(true);
                        return;
                      }
                      patch("category", e.target.value);
                    }}
                    className={`admin-input cursor-pointer ${showErrors && errors.category ? "admin-input-error" : ""}`}
                  >
                    <option value="" disabled>
                      Select a category…
                    </option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__create_new__">+ New category</option>
                  </select>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <TextInput
                  id="menu-price"
                  label="Price (RS)"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={form.price === 0 ? "" : String(form.price)}
                  onChange={(v) => patch("price", v === "" ? 0 : Number(v))}
                  placeholder="12.00"
                  error={showErrors ? errors.price : undefined}
                  hint="Required — e.g. 12.00"
                />
              </div>
            </div>

            <div className="mt-5">
              <TextArea
                id="menu-description"
                label="Description"
                value={form.description}
                onChange={(v) => patch("description", v)}
                placeholder="Slow-cooked basmati with tender chicken & Arabian spices."
                maxLength={2000}
                rows={3}
                error={showErrors ? errors.description : undefined}
              />
            </div>

            <div className="mt-5">
              <Field
                label="Image"
                hint="Choose a JPG, PNG, or WebP image (max 5 MB) from your computer."
                error={showErrors ? errors.imageUrl : undefined}
                htmlFor="menu-image"
              >
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => patch("imageUrl", url)}
                  onPendingKeyChange={handlePendingKeyChange}
                  error={showErrors ? errors.imageUrl : undefined}
                />
              </Field>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Available</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Shown as purchasable on the site.
                  </span>
                </div>
                <Toggle
                  checked={form.available}
                  onChange={(v) => patch("available", v)}
                  label="Available"
                  id="menu-available"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Featured</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Highlighted in the featured carousel.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="menu-featured"
                />
              </div>
            </div>

            {serverError && (
              <p className="mt-4 rounded-xl border border-[var(--brand-cta)]/30 bg-[var(--brand-cta)]/10 px-4 py-3 text-[0.8rem] text-[var(--brand-cta-strong)]" role="alert">
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
                  {mode === "edit" ? "Save changes" : "Add item"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {categoryModalOpen && (
        <MenuCategoryModal
          onClose={() => setCategoryModalOpen(false)}
          onCreated={(category: MenuCategoryData) => {
            setCategoryOptions((prev) =>
              prev.includes(category.name)
                ? prev
                : [...prev, category.name].sort((a, b) => a.localeCompare(b))
            );
            patch("category", category.name);
            setCategoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
