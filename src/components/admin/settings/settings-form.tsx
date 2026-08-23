"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BuildingIcon,
  PhoneIcon,
  ShareIcon,
  SaveIcon,
  RefreshIcon,
} from "@/components/ui/icons";
import { TextInput } from "./text-input";
import { Toggle } from "./toggle";
import { SectionCard } from "./section-card";
import { Toast, type ToastState } from "./toast";
import type { SettingsData, SocialKey } from "@/lib/settings/types";
import { validateSettings, type SettingsErrors, type SocialMediaErrorKey } from "@/lib/settings/validate";

interface SettingsFormProps {
  initialSettings: SettingsData;
}

const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  website: "Website",
};

/** Social links the owner manages here. */
const MANAGED_SOCIALS: SocialKey[] = ["facebook", "instagram", "tiktok"];

function isDirty(current: SettingsData, saved: SettingsData): boolean {
  return JSON.stringify(current) !== JSON.stringify(saved);
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [form, setForm] = useState<SettingsData>(() => structuredClone(initialSettings));
  const [saved, setSaved] = useState<SettingsData>(() => structuredClone(initialSettings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const dirty = useMemo(() => isDirty(form, saved), [form, saved]);

  const patch = useCallback(<K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const patchSocial = useCallback((key: SocialKey, partial: { url?: string; enabled?: boolean }) => {
    setForm((f) => ({
      ...f,
      socialMedia: { ...f.socialMedia, [key]: { ...f.socialMedia[key], ...partial } },
    }));
    setErrors((e) => {
      const errorKey = `socialMedia_${key}` as SocialMediaErrorKey;
      if (!(errorKey in e)) return e;
      const next = { ...e };
      delete next[errorKey];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    const nextErrors = validateSettings(form);
    setErrors(nextErrors);
    setShowErrors(true);
    if (Object.keys(nextErrors).length > 0) {
      setToast({ type: "error", message: "Some fields need attention before saving." });
      return;
    }

    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverErrors = data?.errors as SettingsErrors | undefined;
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        }
        setToast({
          type: "error",
          message: data?.error ?? "Could not save settings. Please try again.",
        });
        setSaving(false);
        return;
      }
      if (data?.settings) {
        setSaved(structuredClone(data.settings));
        setForm(structuredClone(data.settings));
      }
      setToast({ type: "success", message: "Settings saved successfully." });
    } catch {
      setToast({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setSaving(false);
    }
  }, [form, saving]);

  return (
    <div className="pb-32">
      <div className="space-y-6">
        {/* 1 — Restaurant */}
        <SectionCard index="01" title="Restaurant" description="The name that appears across the site." icon={BuildingIcon}>
          <TextInput
            id="restaurantName"
            label="Restaurant Name"
            value={form.restaurantName}
            onChange={(v) => patch("restaurantName", v)}
            placeholder="Killo's Biriyani"
            maxLength={120}
            error={showErrors ? errors.restaurantName : undefined}
            hint="Required — shown everywhere on the site."
          />
        </SectionCard>

        {/* 2 — Contact */}
        <SectionCard index="02" title="Contact" description="How guests reach you." icon={PhoneIcon}>
          <div className="admin-field-grid">
            <TextInput
              id="primaryPhone"
              label="Phone Number"
              type="tel"
              value={form.primaryPhone}
              onChange={(v) => patch("primaryPhone", v)}
              placeholder="+94 XX XXX XXXX"
              error={showErrors ? errors.primaryPhone : undefined}
              hint="Required — the main phone number."
            />
            <TextInput
              id="whatsappNumber"
              label="WhatsApp Number"
              type="tel"
              value={form.whatsappNumber}
              onChange={(v) => patch("whatsappNumber", v)}
              placeholder="9477XXXXXXX"
              error={showErrors ? errors.whatsappNumber : undefined}
              hint="In international format without +, e.g. 9477XXXXXXX."
            />
          </div>

          <div className="mt-5">
            <TextInput
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => patch("email", v)}
              placeholder="name@example.com"
              maxLength={160}
              error={showErrors ? errors.email : undefined}
              hint="Required — the inbox for reservations and enquiries."
            />
          </div>
        </SectionCard>

        {/* 3 — Social Media */}
        <SectionCard index="03" title="Social Media" description="Links guests can follow." icon={ShareIcon}>
          <div className="space-y-4">
            {MANAGED_SOCIALS.map((key) => {
              const social = form.socialMedia[key];
              const socialError = showErrors
                ? errors[`socialMedia_${key}` as SocialMediaErrorKey]
                : undefined;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <Toggle
                      checked={social.enabled}
                      onChange={(enabled) => patchSocial(key, { enabled })}
                      label={SOCIAL_LABELS[key]}
                      description={social.enabled ? "Visible on the site" : "Hidden from the site"}
                    />
                  </div>
                  <div className="sm:w-[46%]">
                    <label className="sr-only" htmlFor={`social-${key}`}>
                      {SOCIAL_LABELS[key]} URL
                    </label>
                    <input
                      id={`social-${key}`}
                      type="url"
                      value={social.url}
                      onChange={(e) => patchSocial(key, { url: e.target.value })}
                      placeholder="https://…"
                      disabled={!social.enabled}
                      aria-invalid={!!socialError}
                      className={`admin-input px-3 py-2 text-[0.8rem] ${
                        social.enabled ? "" : "opacity-40"
                      } ${socialError ? "admin-input-error" : ""}`}
                    />
                    {socialError && (
                      <p className="admin-field-error mt-1.5" role="alert">
                        {socialError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Sticky Save Bar */}
      <div className="admin-save-bar">
        <div className="admin-save-bar-inner flex items-center gap-4 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`relative flex h-2 w-2 shrink-0 ${
                dirty ? "text-[var(--accent)]" : "text-[var(--admin-fg-muted)]"
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  dirty ? "animate-ping bg-[var(--accent)] opacity-60" : "bg-[var(--admin-fg-muted)] opacity-30"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  dirty ? "bg-[var(--accent)]" : "bg-[var(--admin-fg-muted)]"
                }`}
              />
            </span>
            <p className="truncate text-[0.8rem] text-[var(--admin-fg-soft)]">
              {dirty ? "You have unsaved changes" : "All changes saved"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {dirty && (
              <button
                type="button"
                onClick={() => setForm(structuredClone(saved))}
                className="admin-btn admin-btn-ghost hidden sm:inline-flex"
              >
                <RefreshIcon size={16} />
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
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
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
