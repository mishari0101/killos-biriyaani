"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { AttractionToolbar } from "./attraction-toolbar";
import { AttractionGrid } from "./attraction-grid";
import { AttractionItemForm } from "./attraction-item-form";
import { AttractionDeleteModal } from "./attraction-delete-modal";
import { AttractionEmptyState } from "./attraction-empty-state";
import type { AttractionData, AttractionListResult } from "@/lib/attractions/types";
import type { AttractionInput } from "@/lib/attractions/validate";

const PAGE_SIZE = 50;

interface AttractionManagerProps {
  initial: AttractionListResult;
}

type FormState = { mode: "create" } | { mode: "edit"; item: AttractionData } | null;

interface AttractionErrorsResult {
  errors?: Record<string, string>;
  error?: string;
}

interface ActiveFilters {
  search: string;
  visibility: "all" | "visible" | "hidden";
  featured: "all" | "featured" | "regular";
}

function matchesFilters(item: AttractionData, filters: ActiveFilters): boolean {
  if (filters.visibility === "visible" && !item.visible) return false;
  if (filters.visibility === "hidden" && item.visible) return false;
  if (filters.featured === "featured" && !item.featured) return false;
  if (filters.featured === "regular" && item.featured) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
    return false;
  }
  return true;
}

/** Canonical public order: featured first, then display order, then id. */
function compareAttractions(a: AttractionData, b: AttractionData): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  return a.id - b.id;
}

export function AttractionManager({ initial }: AttractionManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [featured, setFeatured] = useState<"all" | "featured" | "regular">("all");
  const [data, setData] = useState<AttractionListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttractionData | null>(null);
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
    fetch(`/api/attractions?page=1&pageSize=${PAGE_SIZE}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the attractions." });
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
    () => data.items.filter((item) => matchesFilters(item, filters)).sort(compareAttractions),
    [data.items, filters]
  );

  const hasFilters = Boolean(searchInput || visibility !== "all" || featured !== "all");

  const handleSave = useCallback(
    async (input: AttractionInput): Promise<AttractionErrorsResult> => {
      const editing = formState?.mode === "edit";
      const url = editing ? `/api/attractions/${formState.item.id}` : "/api/attractions";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { errors: payload?.errors, error: payload?.error ?? "Something went wrong." };
      }

      let toastMessage = editing ? "Attraction updated." : "Attraction added.";
      if (!editing && payload?.item) {
        const created = payload.item as AttractionData;
        if (matchesFilters(created, filters)) {
          setData((prev) => {
            if (prev.items.some((i) => i.id === created.id)) return prev;
            const next = [...prev.items, created].sort(compareAttractions);
            return { ...prev, items: next, total: prev.total + 1 };
          });
        } else {
          toastMessage = "Attraction added successfully. It is hidden by the current filters.";
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
    async (item: AttractionData, patch: { visible?: boolean; featured?: boolean }) => {
      const updated = { ...item, ...patch };
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)),
      }));
      const res = await fetch(`/api/attractions/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not update the attraction." });
        return;
      }
      const saved = payload.item as AttractionData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)).sort(compareAttractions),
      }));
      setToast({ type: "success", message: "Attraction updated." });
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/attractions/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the attraction." });
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
    setToast({ type: "success", message: "Attraction deleted." });
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

      const res = await fetch("/api/attractions/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map(({ id, displayOrder }) => ({ id, displayOrder })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not reorder the attractions." });
        return;
      }
      refreshInBackground();
      setToast({ type: "success", message: "Attraction order updated." });
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
      <AttractionToolbar
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
        <AttractionEmptyState
          hasFilters={hasFilters}
          onAdd={() => setFormState({ mode: "create" })}
          onClear={clearFilters}
        />
      ) : (
        <AttractionGrid
          items={visibleItems}
          loading={loading}
          onEdit={(item) => setFormState({ mode: "edit", item })}
          onDelete={setDeleteTarget}
          onToggle={handleToggle}
          onReorder={handleReorder}
        />
      )}

      {formState && (
        <AttractionItemForm
          mode={formState.mode}
          item={formState.mode === "edit" ? formState.item : null}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <AttractionDeleteModal
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
