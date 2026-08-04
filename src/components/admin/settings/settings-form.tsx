"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BuildingIcon,
  PhoneIcon,
  ClockIcon,
  ShareIcon,
  MapPinIcon,
  SaveIcon,
  RefreshIcon,
} from "@/components/ui/icons";
import { TextInput } from "./text-input";
import { Toggle } from "./toggle";
import { SectionCard } from "./section-card";
import { Toast, type ToastState } from "./toast";
import type { SettingsData, SocialKey } from "@/lib/settings/types";
import { DAY_LABELS, DAYS } from "@/lib/settings/types";
import { validateSettings, type SettingsErrors } from "@/lib/settings/validate";

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

  const patchDay = useCallback((day: (typeof DAYS)[number], partial: Partial<SettingsData["businessHours"][number]>) => {
    setForm((f) => ({
      ...f,
      businessHours: f.businessHours.map((h) => (h.day === day ? { ...h, ...partial } : h)),
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next[`businessHours_${day}_open` as keyof SettingsData];
      delete next[`businessHours_${day}_close` as keyof SettingsData];
      return next;
    });
  }, []);

  const patchSocial = useCallback((key: SocialKey, partial: { url?: string; enabled?: boolean }) => {
    setForm((f) => ({
      ...f,
      socialMedia: { ...f.socialMedia, [key]: { ...f.socialMedia[key], ...partial } },
    }));
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
        <SectionCard index="01" title="Restaurant" description="The name and logo that appear across the site." icon={BuildingIcon}>
          <div className="admin-field-grid">
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
            <TextInput
              id="tagline"
              label="Tagline"
              value={form.tagline}
              onChange={(v) => patch("tagline", v)}
              placeholder="Arabian Restaurant"
              maxLength={200}
              error={showErrors ? errors.tagline : undefined}
              hint="A short phrase that sits next to the logo."
            />
          </div>

          <div className="mt-5 admin-field-grid">
            <TextInput
              id="logoUrl"
              label="Logo"
              type="url"
              value={form.logoUrl}
              onChange={(v) => patch("logoUrl", v)}
              placeholder="https://…/logo.png"
              error={showErrors ? errors.logoUrl : undefined}
              hint="Web address of your logo image."
            />
            <TextInput
              id="faviconUrl"
              label="Favicon"
              type="url"
              value={form.faviconUrl}
              onChange={(v) => patch("faviconUrl", v)}
              placeholder="https://…/favicon.png"
              error={showErrors ? errors.faviconUrl : undefined}
              hint="Web address of the small browser-tab icon."
            />
          </div>
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

        {/* 3 — Business Hours */}
        <SectionCard index="03" title="Business Hours" description="Your opening and closing times." icon={ClockIcon}>
          <div className="overflow-hidden rounded-xl border border-[var(--admin-border)]">
            <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.9fr] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-2.5 sm:grid">
              <span className="admin-table-th">Day</span>
              <span className="admin-table-th">Open</span>
              <span className="admin-table-th">Close</span>
              <span className="admin-table-th text-right">Closed</span>
            </div>
            {DAYS.map((day) => {
              const entry = form.businessHours.find((h) => h.day === day)!;
              return (
                <div
                  key={day}
                  className="grid grid-cols-2 gap-3 border-b border-[var(--admin-border)] px-4 py-3 last:border-b-0 sm:grid-cols-[1.4fr_1fr_1fr_0.9fr] sm:items-center"
                >
                  <span className="col-span-2 text-[0.82rem] font-medium text-[var(--admin-fg)] sm:col-span-1">
                    {DAY_LABELS[day]}
                  </span>
                  <label className="sr-only" htmlFor={`hours-${day}-open`}>
                    {DAY_LABELS[day]} open time
                  </label>
                  <input
                    id={`hours-${day}-open`}
                    type="time"
                    value={entry.open}
                    disabled={entry.closed}
                    onChange={(e) => patchDay(day, { open: e.target.value })}
                    className={`admin-input px-3 py-2 text-[0.8rem] ${
                      entry.closed ? "opacity-40" : ""
                    } ${showErrors && errors[`businessHours_${day}_open` as keyof SettingsData] ? "admin-input-error" : ""}`}
                  />
                  <label className="sr-only" htmlFor={`hours-${day}-close`}>
                    {DAY_LABELS[day]} close time
                  </label>
                  <input
                    id={`hours-${day}-close`}
                    type="time"
                    value={entry.close}
                    disabled={entry.closed}
                    onChange={(e) => patchDay(day, { close: e.target.value })}
                    className={`admin-input px-3 py-2 text-[0.8rem] ${
                      entry.closed ? "opacity-40" : ""
                    } ${showErrors && errors[`businessHours_${day}_close` as keyof SettingsData] ? "admin-input-error" : ""}`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={entry.closed}
                      aria-label={`${DAY_LABELS[day]} closed`}
                      onClick={() => patchDay(day, { closed: !entry.closed })}
                      className="admin-toggle"
                      data-on={entry.closed}
                    >
                      <span className="admin-toggle-thumb" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="admin-field-hint mt-3">
            Turn <strong>Closed</strong> on for days the restaurant does not open.
          </p>
        </SectionCard>

        {/* 4 — Location */}
        <SectionCard index="04" title="Location" description="Where the restaurant is on the map." icon={MapPinIcon}>
          <TextInput
            id="mapsEmbedUrl"
            label="Google Maps Link"
            type="url"
            value={form.mapsEmbedUrl}
            onChange={(v) => patch("mapsEmbedUrl", v)}
            placeholder="https://maps.google.com/…"
            error={showErrors ? errors.mapsEmbedUrl : undefined}
            hint="A Google Maps link to the restaurant."
          />
        </SectionCard>

        {/* 5 — Social Media */}
        <SectionCard index="05" title="Social Media" description="Links guests can follow." icon={ShareIcon}>
          <div className="space-y-4">
            {MANAGED_SOCIALS.map((key) => {
              const social = form.socialMedia[key];
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
                      className={`admin-input px-3 py-2 text-[0.8rem] ${
                        social.enabled ? "" : "opacity-40"
                      }`}
                    />
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
