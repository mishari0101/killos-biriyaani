"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { FaqToolbar } from "./faq-toolbar";
import { FaqList } from "./faq-list";
import { FaqItemForm } from "./faq-item-form";
import { FaqDeleteModal } from "./faq-delete-modal";
import { FaqEmptyState } from "./faq-empty-state";
import type { FaqData, FaqListResult } from "@/lib/faqs/types";
import type { FaqInput } from "@/lib/faqs/validate";

interface FaqManagerProps {
  initial: FaqListResult;
}

type FormState = { mode: "create" } | { mode: "edit"; item: FaqData } | null;

interface FaqErrorsResult {
  errors?: Record<string, string>;
  error?: string;
}

interface ActiveFilters {
  search: string;
  visibility: "all" | "visible" | "hidden";
  featured: "all" | "featured" | "regular";
}

function matchesFilters(item: FaqData, filters: ActiveFilters): boolean {
  if (filters.visibility === "visible" && !item.visible) return false;
  if (filters.visibility === "hidden" && item.visible) return false;
  if (filters.featured === "featured" && !item.featured) return false;
  if (filters.featured === "regular" && item.featured) return false;
  const q = filters.search.trim().toLowerCase();
  if (
    q &&
    !item.question.toLowerCase().includes(q) &&
    !item.answer.toLowerCase().includes(q) &&
    !item.category.toLowerCase().includes(q)
  ) {
    return false;
  }
  return true;
}

/** Canonical public order: featured first, then display order, then id. */
function compareFaqs(a: FaqData, b: FaqData): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  return a.id - b.id;
}

export function FaqManager({ initial }: FaqManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [featured, setFeatured] = useState<"all" | "featured" | "regular">("all");
  const [data, setData] = useState<FaqListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqData | null>(null);
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
    fetch("/api/faqs/manage", {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the FAQs." });
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
    () => ({ search: searchInput, visibility, featured }),
    [searchInput, visibility, featured]
  );

  const visibleItems = useMemo(
    () => data.items.filter((item) => matchesFilters(item, filters)).sort(compareFaqs),
    [data.items, filters]
  );

  const hasFilters = Boolean(searchInput || visibility !== "all" || featured !== "all");

  const handleSave = useCallback(
    async (input: FaqInput): Promise<FaqErrorsResult> => {
      const editing = formState?.mode === "edit";
      const url = editing ? `/api/faqs/${formState.item.id}` : "/api/faqs";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { errors: payload?.errors, error: payload?.error ?? "Something went wrong." };
      }

      let toastMessage = editing ? "FAQ updated." : "FAQ added.";
      if (!editing && payload?.item) {
        const created = payload.item as FaqData;
        if (matchesFilters(created, filters)) {
          setData((prev) => {
            if (prev.items.some((i) => i.id === created.id)) return prev;
            const next = [...prev.items, created].sort(compareFaqs);
            return { ...prev, items: next, total: prev.total + 1 };
          });
        } else {
          toastMessage = "FAQ added successfully. It is hidden by the current filters.";
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
    async (item: FaqData, patch: { visible?: boolean; featured?: boolean }) => {
      const updated = { ...item, ...patch };
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)),
      }));
      const res = await fetch(`/api/faqs/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not update the FAQ." });
        return;
      }
      const saved = payload.item as FaqData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)).sort(compareFaqs),
      }));
      setToast({ type: "success", message: "FAQ updated." });
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/faqs/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the FAQ." });
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
    setToast({ type: "success", message: "FAQ deleted." });
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

      const res = await fetch("/api/faqs/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map(({ id, displayOrder }) => ({ id, displayOrder })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not reorder the FAQs." });
        return;
      }
      refreshInBackground();
      setToast({ type: "success", message: "FAQ order updated." });
    },
    [data.items, refresh, refreshInBackground]
  );

  const clearFilters = () => {
    setSearchInput("");
    setVisibility("all");
    setFeatured("all");
  };

  return (
    <div className="space-y-6">
      <FaqToolbar
        search={searchInput}
        onSearch={setSearchInput}
        visibility={visibility}
        onVisibility={setVisibility}
        featured={featured}
        onFeatured={setFeatured}
        total={data.total}
        loading={loading}
        onAdd={() => setFormState({ mode: "create" })}
      />

      {visibleItems.length === 0 && !loading ? (
        <FaqEmptyState
          hasFilters={hasFilters}
          onAdd={() => setFormState({ mode: "create" })}
          onClear={clearFilters}
        />
      ) : (
        <FaqList
          items={visibleItems}
          loading={loading}
          onEdit={(item) => setFormState({ mode: "edit", item })}
          onDelete={setDeleteTarget}
          onToggle={handleToggle}
          onReorder={handleReorder}
        />
      )}

      {formState && (
        <FaqItemForm
          mode={formState.mode}
          item={formState.mode === "edit" ? formState.item : null}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <FaqDeleteModal
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
