"use client";

import { useCallback, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { slugifyCategory, type MenuCategoryErrors } from "@/lib/menu/validate";
import type { MenuCategoryData } from "@/lib/menu/types";

interface MenuCategoryModalProps {
  onClose: () => void;
  onCreated: (category: MenuCategoryData) => void;
}

export function MenuCategoryModal({ onClose, onCreated }: MenuCategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<MenuCategoryErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setErrors((e) => {
      if (!("name" in e)) return e;
      const next = { ...e };
      delete next.name;
      return next;
    });
    if (!slugEdited) setSlug(slugifyCategory(value));
  }, [slugEdited]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugEdited(true);
    setSlug(value);
    setErrors((e) => {
      if (!("slug" in e)) return e;
      const next = { ...e };
      delete next.slug;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (saving) return;
    setServerError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          displayOrder: displayOrder === "" ? 0 : Number(displayOrder),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (payload?.errors) {
          setErrors(payload.errors as MenuCategoryErrors);
          setServerError(payload?.error ?? null);
        } else {
          setServerError(payload?.error ?? "Could not create the category.");
        }
        return;
      }
      onCreated(payload.category as MenuCategoryData);
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving, name, slug, displayOrder, onCreated]);

  return (
    <div
      className="admin-scrim fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create a new category"
    >
      <div className="w-full max-w-md">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                Menu categories
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                New category
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="admin-icon-btn flex h-9 w-9 items-center justify-center disabled:opacity-50"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-6 sm:px-7">
            <TextInput
              id="menu-category-name"
              label="Display name"
              value={name}
              onChange={handleNameChange}
              placeholder="Kebab Platter"
              maxLength={80}
              error={errors.name}
              hint="Shown in the dropdown and on menu items."
            />

            <TextInput
              id="menu-category-slug"
              label="Slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="kebab-platter"
              maxLength={80}
              error={errors.slug}
              hint="Auto-generated from the name. Used as a stable identifier."
            />

            <TextInput
              id="menu-category-order"
              label="Display order"
              type="number"
              inputMode="numeric"
              value={displayOrder}
              onChange={(v) => {
                setDisplayOrder(v);
                setErrors((e) => {
                  if (!("displayOrder" in e)) return e;
                  const next = { ...e };
                  delete next.displayOrder;
                  return next;
                });
              }}
              placeholder="0"
              error={errors.displayOrder}
              hint="Lower numbers appear first in the dropdown."
            />

            {serverError && (
              <p
                className="rounded-xl border border-[var(--brand-cta)]/30 bg-[var(--brand-cta)]/10 px-4 py-3 text-[0.8rem] text-[var(--brand-cta-strong)]"
                role="alert"
              >
                {serverError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="admin-btn admin-btn-ghost disabled:opacity-60"
            >
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
                  Creating…
                </>
              ) : (
                <>
                  <SaveIcon size={16} />
                  Create category
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
