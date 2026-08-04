"use client";

import { useCallback, useMemo, useState } from "react";
import {
  EyeIcon,
  GlobeIcon,
  HashIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Toggle } from "@/components/admin/settings/toggle";
import { SectionCard } from "@/components/admin/settings/section-card";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { SeoPreview, usePreviewValues } from "./seo-preview";
import { validateSeo, type SeoErrors, type SeoInput } from "@/lib/seo/validate";
import type { SeoData } from "@/lib/seo/types";

interface SeoManagerProps {
  initialSeo: SeoData;
}

function toForm(seo: SeoData): SeoInput {
  const { updatedAt, ...rest } = seo;
  void updatedAt;
  return rest;
}

function isDirty(current: SeoInput, saved: SeoInput): boolean {
  return JSON.stringify(current) !== JSON.stringify(saved);
}

export function SeoManager({ initialSeo }: SeoManagerProps) {
  const initialForm = useMemo(() => toForm(initialSeo), [initialSeo]);
  const [form, setForm] = useState<SeoInput>(() => toForm(initialSeo));
  const [saved, setSaved] = useState<SeoInput>(() => toForm(initialSeo));
  const [errors, setErrors] = useState<SeoErrors>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const dirty = useMemo(() => isDirty(form, saved), [form, saved]);
  const preview = usePreviewValues(form);

  const patch = useCallback(<K extends keyof SeoInput>(key: K, value: SeoInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    const nextErrors = validateSeo(form);
    setErrors(nextErrors);
    setShowErrors(true);
    if (Object.keys(nextErrors).length > 0) {
      setToast({ type: "error", message: "Some fields need attention before saving." });
      return;
    }

    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverErrors = data?.errors as SeoErrors | undefined;
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        }
        setToast({
          type: "error",
          message: data?.error ?? "Could not save SEO settings. Please try again.",
        });
        setSaving(false);
        return;
      }
      if (data?.seo) {
        const next = toForm(data.seo as SeoData);
        setSaved(next);
        setForm(next);
      }
      setToast({ type: "success", message: "SEO settings saved and applied to the live site." });
    } catch {
      setToast({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setSaving(false);
    }
  }, [form, saving]);

  const robotsSection = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
        <Toggle
          checked={form.robotsIndex}
          onChange={(v) => patch("robotsIndex", v)}
          label="Allow Indexing"
          description="Whether search engines may show the site in results."
        />
      </div>
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
        <Toggle
          checked={form.robotsFollow}
          onChange={(v) => patch("robotsFollow", v)}
          label="Allow Follow"
          description="Whether crawlers may follow links on the site."
        />
      </div>
    </div>
  );

  return (
    <div className="pb-32">
      <div className="space-y-6">
        {/* Live Preview */}
        <SectionCard index="A" title="Live Preview" description="See exactly how Google and social platforms will show the site." icon={EyeIcon}>
          <SeoPreview values={preview} />
        </SectionCard>

        {/* 1 — Search & Indexing */}
        <SectionCard index="01" title="Search & Indexing" description="The title, description and crawler rules shown in search engines." icon={SearchIcon}>
          <div className="admin-field-grid">
            <TextInput
              id="siteTitle"
              label="Site Title"
              value={form.siteTitle}
              onChange={(v) => patch("siteTitle", v)}
              placeholder="Killo's Biriyani"
              maxLength={200}
              error={showErrors ? errors.siteTitle : undefined}
              hint="Short brand name used in the browser tab and structured data."
            />
            <TextInput
              id="metaTitle"
              label="Default Meta Title"
              value={form.metaTitle}
              onChange={(v) => patch("metaTitle", v)}
              placeholder="Killo's Biriyani — Arabian Restaurant"
              maxLength={200}
              error={showErrors ? errors.metaTitle : undefined}
              hint="The headline shown in Google results (~60 characters ideal)."
            />
          </div>

          <div className="mt-5">
            <TextArea
              id="metaDescription"
              label="Default Meta Description"
              value={form.metaDescription}
              onChange={(v) => patch("metaDescription", v)}
              placeholder="A concise description shown under the title in search results."
              maxLength={400}
              rows={3}
              error={showErrors ? errors.metaDescription : undefined}
              hint="Around 155 characters shows fully in Google results."
            />
          </div>

          <div className="mt-5">
            <TextArea
              id="keywords"
              label="Keywords"
              value={form.keywords}
              onChange={(v) => patch("keywords", v)}
              placeholder="biriyani, arabian food, restaurant, …"
              maxLength={400}
              rows={2}
              error={showErrors ? errors.keywords : undefined}
              hint="Comma-separated keywords. Minor ranking weight today."
            />
          </div>

          <div className="mt-5">
            <TextInput
              id="canonicalUrl"
              label="Canonical URL"
              type="url"
              value={form.canonicalUrl}
              onChange={(v) => patch("canonicalUrl", v)}
              placeholder="https://killosbiriyani.com"
              maxLength={500}
              error={showErrors ? errors.canonicalUrl : undefined}
              hint="The official site URL. Drives canonical tags, the sitemap and robots.txt."
            />
          </div>

          <div className="mt-6">{robotsSection}</div>
        </SectionCard>

        {/* 2 — Open Graph */}
        <SectionCard index="02" title="Open Graph" description="The card shown when the site is shared on Facebook, WhatsApp and LinkedIn." icon={ShareIcon}>
          <div className="admin-field-grid">
            <TextInput
              id="ogTitle"
              label="Open Graph Title"
              value={form.ogTitle}
              onChange={(v) => patch("ogTitle", v)}
              placeholder="Killo's Biriyani — Arabian Restaurant"
              maxLength={200}
              error={showErrors ? errors.ogTitle : undefined}
              hint="Defaults to the meta title when left empty."
            />
            <TextInput
              id="ogDescription"
              label="Open Graph Description"
              value={form.ogDescription}
              onChange={(v) => patch("ogDescription", v)}
              placeholder="Authentic Arabian biriyani, dum-cooked over open fire…"
              maxLength={400}
              error={showErrors ? errors.ogDescription : undefined}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[0.82rem] font-medium text-[var(--admin-fg)]">Open Graph Image</p>
            <ImageUpload
              value={form.ogImage}
              folder="seo"
              onChange={(v) => patch("ogImage", v)}
              error={showErrors ? errors.ogImage : undefined}
              altLabel="Open Graph image preview"
            />
            <p className="admin-field-hint mt-2">
              1200×630 recommended. Shown as the link preview on Facebook, WhatsApp and LinkedIn.
            </p>
          </div>
        </SectionCard>

        {/* 3 — Twitter Cards */}
        <SectionCard index="03" title="Twitter Cards" description="The card shown when the site is shared on X (formerly Twitter)." icon={GlobeIcon}>
          <div className="admin-field-grid">
            <TextInput
              id="twitterTitle"
              label="Twitter Title"
              value={form.twitterTitle}
              onChange={(v) => patch("twitterTitle", v)}
              placeholder="Killo's Biriyani — Arabian Restaurant"
              maxLength={200}
              error={showErrors ? errors.twitterTitle : undefined}
              hint="Defaults to the Open Graph title when left empty."
            />
            <TextInput
              id="twitterDescription"
              label="Twitter Description"
              value={form.twitterDescription}
              onChange={(v) => patch("twitterDescription", v)}
              placeholder="Authentic Arabian biriyani, dum-cooked over open fire…"
              maxLength={400}
              error={showErrors ? errors.twitterDescription : undefined}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[0.82rem] font-medium text-[var(--admin-fg)]">Twitter Image</p>
            <ImageUpload
              value={form.twitterImage}
              folder="seo"
              onChange={(v) => patch("twitterImage", v)}
              error={showErrors ? errors.twitterImage : undefined}
              altLabel="Twitter image preview"
            />
            <p className="admin-field-hint mt-2">
              1200×675 recommended. Falls back to the Open Graph image when empty.
            </p>
          </div>
        </SectionCard>

        {/* 4 — Verification & Analytics */}
        <SectionCard index="04" title="Verification & Analytics" description="Connect analytics, Tag Manager and confirm ownership of the domain." icon={ShieldIcon}>
          <div className="admin-field-grid">
            <TextInput
              id="googleAnalyticsId"
              label="Google Analytics ID"
              value={form.googleAnalyticsId}
              onChange={(v) => patch("googleAnalyticsId", v)}
              placeholder="G-ABC123XYZ"
              maxLength={40}
              error={showErrors ? errors.googleAnalyticsId : undefined}
              hint="GA4 Measurement ID — injects the gtag snippet site-wide."
            />
            <TextInput
              id="googleTagManagerId"
              label="Google Tag Manager ID"
              value={form.googleTagManagerId}
              onChange={(v) => patch("googleTagManagerId", v)}
              placeholder="GTM-ABC1234"
              maxLength={40}
              error={showErrors ? errors.googleTagManagerId : undefined}
              hint="Container ID — injects the GTM loader snippet site-wide."
            />
          </div>

          <div className="mt-5 admin-field-grid">
            <TextInput
              id="googleSiteVerification"
              label="Google Site Verification"
              value={form.googleSiteVerification}
              onChange={(v) => patch("googleSiteVerification", v)}
              placeholder="Google Search Console verification code"
              maxLength={200}
              error={showErrors ? errors.googleSiteVerification : undefined}
              hint="Adds the google-site-verification meta tag."
            />
            <TextInput
              id="facebookDomainVerification"
              label="Facebook Domain Verification"
              value={form.facebookDomainVerification}
              onChange={(v) => patch("facebookDomainVerification", v)}
              placeholder="Facebook Business verification code"
              maxLength={200}
              error={showErrors ? errors.facebookDomainVerification : undefined}
              hint="Adds the facebook-domain-verification meta tag."
            />
          </div>
        </SectionCard>

        <SectionCard index="05" title="Why every change goes live instantly" description="How the SEO panel drives the whole site." icon={HashIcon}>
          <ul className="grid grid-cols-1 gap-3 text-[0.82rem] leading-relaxed text-[var(--admin-fg-soft)] sm:grid-cols-2">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              Meta, Open Graph, Twitter and canonical tags are generated from these fields on every page load.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              The robots meta tag and robots.txt respect the Index / Follow toggles.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              sitemap.xml is generated from the canonical URL and stays in sync automatically.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              Restaurant, Organization and WebSite structured data use the same brand values.
            </li>
          </ul>
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
                onClick={() => {
                  setForm(initialForm);
                  setErrors({});
                  setShowErrors(false);
                }}
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
