"use client";

import { useCallback, useState } from "react";
import { CloseIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import type { FaqData } from "@/lib/faqs/types";
import {
  validateFaq,
  type FaqErrors,
  type FaqInput,
} from "@/lib/faqs/validate";

interface FaqItemFormProps {
  mode: "create" | "edit";
  item: FaqData | null;
  onClose: () => void;
  onSave: (input: FaqInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

const emptyForm: FaqInput = {
  question: "",
  answer: "",
  category: "",
  displayOrder: 0,
  featured: false,
  visible: true,
};

function toForm(item: FaqData | null): FaqInput {
  if (!item) return { ...emptyForm };
  return {
    question: item.question,
    answer: item.answer,
    category: item.category,
    displayOrder: item.displayOrder,
    featured: item.featured,
    visible: item.visible,
  };
}

export function FaqItemForm({ mode, item, onClose, onSave }: FaqItemFormProps) {
  const [form, setForm] = useState<FaqInput>(() => toForm(item));
  const [errors, setErrors] = useState<FaqErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const patch = useCallback(<K extends keyof FaqInput>(key: K, value: FaqInput[K]) => {
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
    const nextErrors = validateFaq(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as FaqErrors);
        setServerError(result.error ?? null);
      } else if (result.error) {
        setServerError(result.error);
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
      aria-label={mode === "edit" ? "Edit FAQ" : "Add FAQ"}
    >
      <div className="admin-modal-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit FAQ" : "New FAQ"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? "Edit question" : "Add a question"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
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
                  id="faq-question"
                  label="Question"
                  value={form.question}
                  onChange={(v) => patch("question", v)}
                  placeholder="What are your opening hours?"
                  maxLength={300}
                  error={showErrors ? errors.question : undefined}
                  hint="Required — shown in bold on the public FAQ accordion."
                />
              </div>

              <div className="sm:col-span-2">
                <TextArea
                  id="faq-answer"
                  label="Answer"
                  value={form.answer}
                  onChange={(v) => patch("answer", v)}
                  placeholder="We are open daily from 10:00 AM to 12:00 AM."
                  maxLength={4000}
                  rows={5}
                  error={showErrors ? errors.answer : undefined}
                />
              </div>

              <div>
                <TextInput
                  id="faq-category"
                  label="Category"
                  value={form.category}
                  onChange={(v) => patch("category", v)}
                  placeholder="Hours, Orders, Dining…"
                  maxLength={80}
                  error={showErrors ? errors.category : undefined}
                  hint="Optional — a short label shown as a chip."
                />
              </div>

              <div>
                <TextInput
                  id="faq-order"
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

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Visible</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Shown in the site&rsquo;s FAQ accordion.
                  </span>
                </div>
                <Toggle
                  checked={form.visible}
                  onChange={(v) => patch("visible", v)}
                  label="Visible"
                  id="faq-visible"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Featured</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Always appears first in the FAQ section.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="faq-featured"
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
            <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost">
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
                  {mode === "edit" ? "Save changes" : "Add FAQ"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
