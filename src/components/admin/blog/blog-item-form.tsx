"use client";

import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CloseIcon, EyeIcon, PenLineIcon, SaveIcon } from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { TextArea } from "@/components/admin/settings/text-area";
import { Field } from "@/components/admin/settings/field";
import { Toggle } from "@/components/admin/settings/toggle";
import { ImageUpload } from "@/components/admin/image-upload";
import { deleteUploadedFile } from "@/lib/uploads/client";
import { renderMarkdown } from "@/lib/blog/markdown";
import type { BlogData } from "@/lib/blog/types";
import {
  slugifyBlog,
  validateBlog,
  type BlogErrors,
  type BlogInput,
} from "@/lib/blog/validate";

interface BlogItemFormProps {
  mode: "create" | "edit";
  item: BlogData | null;
  onClose: () => void;
  onSave: (input: BlogInput) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

const emptyForm: BlogInput = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: "",
  author: "",
  featured: false,
  published: false,
  publishedAt: null,
  displayOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

function toForm(item: BlogData | null): BlogInput {
  if (!item) return { ...emptyForm };
  return {
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    coverImage: item.coverImage,
    category: item.category,
    tags: item.tags,
    author: item.author,
    featured: item.featured,
    published: item.published,
    publishedAt: item.publishedAt,
    displayOrder: item.displayOrder,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
  };
}

/** Format an ISO timestamp for a native datetime-local input (local time). */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const previewVars = {
  "--fg": "#171717",
  "--fg-soft": "#4b4b4b",
  "--accent": "#c9a227",
  "--accent-strong": "#a8871d",
  "--blog-code-bg": "#f4f4f2",
  "--blog-code-border": "#e5e5e0",
  "--blog-code-fg": "#6b4d1a",
  "--blog-quote-bg": "#faf9f5",
  "--blog-hr": "#e8e8e4",
} as CSSProperties;

export function BlogItemForm({ mode, item, onClose, onSave }: BlogItemFormProps) {
  const [form, setForm] = useState<BlogInput>(() => toForm(item));
  const [errors, setErrors] = useState<BlogErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
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

  const patch = useCallback(<K extends keyof BlogInput>(key: K, value: BlogInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const handlePublishToggle = useCallback(
    (value: boolean) => {
      if (value && !form.publishedAt) {
        patch("publishedAt", new Date().toISOString());
      }
      patch("published", value);
    },
    [form.publishedAt, patch]
  );

  const handleSubmit = useCallback(async () => {
    if (saving) return;
    const nextErrors = validateBlog(form);
    setErrors(nextErrors);
    setShowErrors(true);
    setServerError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await onSave(form);
      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors as BlogErrors);
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

  const liveSlug = mode === "edit" ? item?.slug ?? "" : slugifyBlog(form.title);

  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "edit" ? "Edit blog post" : "New blog post"}
    >
      <div className="admin-modal-scroll max-h-[94vh] w-full max-w-4xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
                {mode === "edit" ? "Edit post" : "New post"}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[var(--admin-fg)]">
                {mode === "edit" ? "Edit article" : "Write an article"}
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
                  id="blog-title"
                  label="Title"
                  value={form.title}
                  onChange={(v) => patch("title", v)}
                  placeholder="What’s the story about?"
                  maxLength={200}
                  error={showErrors ? errors.title : undefined}
                  hint="Required — shown on the post card and as the page title."
                />
              </div>

              <div className="sm:col-span-2">
                <Field label="URL Slug" hint="Auto-generated from the title and locked after the first save.">
                  <div className="admin-input flex items-center gap-1.5 bg-[var(--admin-field-bg)] text-[0.82rem] text-[var(--admin-fg-muted)]">
                    <span className="truncate">/blog/{liveSlug || "your-post-slug"}</span>
                  </div>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Cover Image"
                  hint="Optional — a wide JPG, PNG, or WebP (max 5 MB). Shown at the top of the article."
                  error={showErrors ? errors.coverImage : undefined}
                  htmlFor="blog-cover"
                >
                  <ImageUpload
                    value={form.coverImage}
                    folder="blog"
                    onChange={(url) => patch("coverImage", url)}
                    onPendingKeyChange={handlePendingKeyChange}
                    error={showErrors ? errors.coverImage : undefined}
                    aspect="16 / 9"
                    altLabel="Blog cover preview"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <TextArea
                  id="blog-excerpt"
                  label="Excerpt"
                  value={form.excerpt}
                  onChange={(v) => patch("excerpt", v)}
                  placeholder="A short summary shown on the blog listing and in search results."
                  maxLength={500}
                  rows={3}
                  error={showErrors ? errors.excerpt : undefined}
                  hint="Required — one or two sentences."
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Content"
                  hint="Markdown supported — headings, lists, quotes, links and code blocks."
                  error={showErrors ? errors.content : undefined}
                  htmlFor="blog-content"
                  charCount={`${form.content.length}/100000`}
                >
                  <div className="flex items-center gap-1 rounded-t-xl border border-b-0 border-[var(--admin-border)] bg-[var(--admin-card)] p-1.5">
                    <button
                      type="button"
                      onClick={() => setTab("write")}
                      aria-pressed={tab === "write"}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                        tab === "write"
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg)]"
                      }`}
                    >
                      <PenLineIcon size={13} />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("preview")}
                      aria-pressed={tab === "preview"}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                        tab === "preview"
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg)]"
                      }`}
                    >
                      <EyeIcon size={13} />
                      Preview
                    </button>
                  </div>
                  {tab === "write" ? (
                    <textarea
                      id="blog-content"
                      value={form.content}
                      onChange={(e) => patch("content", e.target.value)}
                      placeholder={
                        "# A heading\n\nWrite your story here. Markdown like **bold**, *italics* and [links](https://example.com) is supported."
                      }
                      rows={14}
                      className={`admin-input resize-y rounded-t-none font-mono text-[0.82rem] leading-relaxed ${
                        errors.content ? "admin-input-error" : ""
                      }`}
                    />
                  ) : (
                    <div
                      className="max-h-[420px] overflow-y-auto rounded-b-xl border border-[var(--admin-border)] bg-white px-6 py-5 text-neutral-900"
                      style={previewVars}
                    >
                      {form.content.trim() ? (
                        renderMarkdown(form.content)
                      ) : (
                        <p className="py-6 text-center text-[0.8rem] text-neutral-400">
                          Nothing to preview yet — start writing in the Write tab.
                        </p>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <div>
                <TextInput
                  id="blog-category"
                  label="Category"
                  value={form.category}
                  onChange={(v) => patch("category", v)}
                  placeholder="News, Offers, Stories…"
                  maxLength={80}
                  error={showErrors ? errors.category : undefined}
                  hint="Optional — shown as a chip and used as a filter."
                />
              </div>

              <div>
                <TextInput
                  id="blog-tags"
                  label="Tags"
                  value={form.tags}
                  onChange={(v) => patch("tags", v)}
                  placeholder="biriyani, offers, weekend"
                  maxLength={400}
                  error={showErrors ? errors.tags : undefined}
                  hint="Optional — comma-separated."
                />
              </div>

              <div>
                <TextInput
                  id="blog-author"
                  label="Author"
                  value={form.author}
                  onChange={(v) => patch("author", v)}
                  placeholder="Killo’s Kitchen Team"
                  maxLength={120}
                  error={showErrors ? errors.author : undefined}
                  hint="Optional — who wrote the article."
                />
              </div>

              <div>
                <TextInput
                  id="blog-order"
                  label="Display Order"
                  type="number"
                  inputMode="numeric"
                  value={form.displayOrder === 0 ? "0" : String(form.displayOrder)}
                  onChange={(v) => patch("displayOrder", Number(v))}
                  error={showErrors ? errors.displayOrder : undefined}
                  hint="Lower numbers appear first."
                />
              </div>

              <div>
                <Field
                  label="Publish Date"
                  hint="When the post appears published. Drafts stay hidden."
                  error={showErrors ? errors.publishedAt : undefined}
                  htmlFor="blog-published-at"
                >
                  <input
                    id="blog-published-at"
                    type="datetime-local"
                    value={toLocalInput(form.publishedAt)}
                    onChange={(e) => patch("publishedAt", fromLocalInput(e.target.value))}
                    className={`admin-input ${errors.publishedAt ? "admin-input-error" : ""}`}
                  />
                </Field>
              </div>

              <div>
                <TextInput
                  id="blog-seo-title"
                  label="SEO Title"
                  value={form.seoTitle}
                  onChange={(v) => patch("seoTitle", v)}
                  placeholder="Custom search-result title"
                  maxLength={200}
                  error={showErrors ? errors.seoTitle : undefined}
                  hint="Optional — falls back to the post title."
                />
              </div>

              <div className="sm:col-span-2">
                <TextArea
                  id="blog-seo-description"
                  label="SEO Description"
                  value={form.seoDescription}
                  onChange={(v) => patch("seoDescription", v)}
                  placeholder="Custom meta description shown in search results."
                  maxLength={400}
                  rows={2}
                  error={showErrors ? errors.seoDescription : undefined}
                  hint="Optional — falls back to the excerpt."
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Published</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Live on the public blog. Drafts stay hidden.
                  </span>
                </div>
                <Toggle
                  checked={form.published}
                  onChange={handlePublishToggle}
                  label="Published"
                  id="blog-published"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.82rem] font-medium text-[var(--admin-fg)]">Featured</span>
                  <span className="text-[0.72rem] text-[var(--admin-fg-muted)]">
                    Always appears first on the blog listing.
                  </span>
                </div>
                <Toggle
                  checked={form.featured}
                  onChange={(v) => patch("featured", v)}
                  label="Featured"
                  id="blog-featured"
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
                  {mode === "edit" ? "Save changes" : "Publish post"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
