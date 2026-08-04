"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { BlogToolbar } from "./blog-toolbar";
import { BlogList } from "./blog-list";
import { BlogItemForm } from "./blog-item-form";
import { BlogDeleteModal } from "./blog-delete-modal";
import { BlogEmptyState } from "./blog-empty-state";
import { BlogSkeleton } from "./blog-skeleton";
import type { BlogData, BlogListResult } from "@/lib/blog/types";
import type { BlogInput } from "@/lib/blog/validate";

interface BlogManagerProps {
  initial: BlogListResult;
}

type FormState = { mode: "create" } | { mode: "edit"; item: BlogData } | null;

interface BlogErrorsResult {
  errors?: Record<string, string>;
  error?: string;
}

interface ActiveFilters {
  search: string;
  status: "all" | "published" | "draft";
  featured: "all" | "featured" | "regular";
  category: string;
}

function matchesFilters(item: BlogData, filters: ActiveFilters): boolean {
  if (filters.status === "published" && !item.published) return false;
  if (filters.status === "draft" && item.published) return false;
  if (filters.featured === "featured" && !item.featured) return false;
  if (filters.featured === "regular" && item.featured) return false;
  if (filters.category !== "all" && item.category !== filters.category) return false;
  const q = filters.search.trim().toLowerCase();
  if (
    q &&
    !item.title.toLowerCase().includes(q) &&
    !item.excerpt.toLowerCase().includes(q) &&
    !item.content.toLowerCase().includes(q) &&
    !item.category.toLowerCase().includes(q) &&
    !item.tags.toLowerCase().includes(q) &&
    !item.author.toLowerCase().includes(q)
  ) {
    return false;
  }
  return true;
}

/** Canonical public order: featured first, then display order, then id. */
function compareBlogs(a: BlogData, b: BlogData): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  return a.id - b.id;
}

function toInput(item: BlogData, patch: { published?: boolean; featured?: boolean }): BlogInput {
  let publishedAt = item.publishedAt;
  if (patch.published && !publishedAt) publishedAt = new Date().toISOString();
  return {
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    coverImage: item.coverImage,
    category: item.category,
    tags: item.tags,
    author: item.author,
    featured: patch.featured ?? item.featured,
    published: patch.published ?? item.published,
    publishedAt,
    displayOrder: item.displayOrder,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
  };
}

export function BlogManager({ initial }: BlogManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [featured, setFeatured] = useState<"all" | "featured" | "regular">("all");
  const [category, setCategory] = useState("all");
  const [data, setData] = useState<BlogListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLoading(true);
  }, []);

  const refreshInBackground = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/blog/manage", {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the blog posts." });
        }
      })
      .catch(() => {
        if (!ignore) setToast({ type: "error", message: "Could not reach the server." });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const filters: ActiveFilters = useMemo(
    () => ({ search: searchInput, status, featured, category }),
    [searchInput, status, featured, category]
  );

  const visibleItems = useMemo(
    () => data.items.filter((item) => matchesFilters(item, filters)).sort(compareBlogs),
    [data.items, filters]
  );

  const hasFilters = Boolean(
    searchInput || status !== "all" || featured !== "all" || category !== "all"
  );

  const handleSave = useCallback(
    async (input: BlogInput): Promise<BlogErrorsResult> => {
      const editing = formState?.mode === "edit";
      const url = editing ? `/api/blog/${formState.item.id}` : "/api/blog";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { errors: payload?.errors, error: payload?.error ?? "Something went wrong." };
      }

      let toastMessage = editing ? "Post updated." : "Post added.";
      if (!editing && payload?.item) {
        const created = payload.item as BlogData;
        if (matchesFilters(created, filters)) {
          setData((prev) => {
            if (prev.items.some((i) => i.id === created.id)) return prev;
            const next = [...prev.items, created].sort(compareBlogs);
            return { ...prev, items: next, total: prev.total + 1 };
          });
        } else {
          toastMessage = "Post added successfully. It is hidden by the current filters.";
        }
      }

      setFormState(null);
      if (editing) {
        refresh();
      } else {
        refreshInBackground();
      }
      setToast({ type: "success", message: toastMessage });
      return {};
    },
    [formState, filters, refresh, refreshInBackground]
  );

  const handleToggle = useCallback(
    async (item: BlogData, patch: { published?: boolean; featured?: boolean }) => {
      const optimistic = { ...item, ...patch };
      if (patch.published && !optimistic.publishedAt) {
        optimistic.publishedAt = new Date().toISOString();
      }
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? optimistic : i)).sort(compareBlogs),
      }));
      const res = await fetch(`/api/blog/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toInput(item, patch)),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not update the post." });
        return;
      }
      const saved = payload.item as BlogData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)).sort(compareBlogs),
      }));
      setToast({
        type: "success",
        message: patch.published !== undefined
          ? patch.published
            ? "Post published."
            : "Post moved back to drafts."
          : "Post updated.",
      });
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/blog/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the post." });
      setDeleting(false);
      return;
    }
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== deleteTarget.id),
      total: Math.max(0, prev.total - 1),
    }));
    setDeleteTarget(null);
    setDeleting(false);
    setToast({ type: "success", message: "Post deleted." });
  }, [deleteTarget, deleting]);

  const handleReorder = useCallback(
    async (sourceId: number, targetId: number) => {
      const list = data.items.map((i) => i);
      const from = list.findIndex((i) => i.id === sourceId);
      const to = list.findIndex((i) => i.id === targetId);
      if (from === -1 || to === -1 || from === to) return;

      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      const reordered = list.map((item, index) => ({ ...item, displayOrder: index }));
      setData((prev) => ({ ...prev, items: reordered }));

      const res = await fetch("/api/blog/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map(({ id, displayOrder }) => ({ id, displayOrder })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not reorder the posts." });
        return;
      }
      refreshInBackground();
      setToast({ type: "success", message: "Post order updated." });
    },
    [data.items, refresh, refreshInBackground]
  );

  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
    setFeatured("all");
    setCategory("all");
  };

  if (loading && data.items.length === 0) {
    return (
      <div className="space-y-6">
        <BlogSkeleton />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlogToolbar
        search={searchInput}
        onSearch={setSearchInput}
        status={status}
        onStatus={setStatus}
        featured={featured}
        onFeatured={setFeatured}
        category={category}
        onCategory={setCategory}
        categories={data.categories}
        total={data.total}
        loading={loading}
        onAdd={() => setFormState({ mode: "create" })}
      />

      {visibleItems.length === 0 && !loading ? (
        <BlogEmptyState
          hasFilters={hasFilters}
          onAdd={() => setFormState({ mode: "create" })}
          onClear={clearFilters}
        />
      ) : (
        <BlogList
          items={visibleItems}
          loading={loading}
          onEdit={(item) => setFormState({ mode: "edit", item })}
          onDelete={setDeleteTarget}
          onToggle={handleToggle}
          onReorder={handleReorder}
        />
      )}

      {formState && (
        <BlogItemForm
          mode={formState.mode}
          item={formState.mode === "edit" ? formState.item : null}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <BlogDeleteModal
          item={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
