"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { CloseIcon } from "@/components/ui/icons";
import { GalleryToolbar } from "./gallery-toolbar";
import { GalleryGrid } from "./gallery-grid";
import { GalleryItemForm } from "./gallery-item-form";
import { GalleryDeleteModal } from "./gallery-delete-modal";
import { GalleryEmptyState } from "./gallery-empty-state";
import type { GalleryItemData, GalleryListResult } from "@/lib/gallery/types";
import type { GalleryItemInput } from "@/lib/gallery/validate";

const PAGE_SIZE = 50;
const HINT_STORAGE_KEY = "killo-admin-gallery-hint-dismissed";

/** Standalone functions so the hint flag survives re-renders via useSyncExternalStore. */
const hintListeners = new Set<() => void>();

function subscribeHint(callback: () => void): () => void {
  hintListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    hintListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getHintSnapshot(): boolean {
  try {
    return window.localStorage.getItem(HINT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getHintServerSnapshot(): boolean {
  return true;
}

interface GalleryManagerProps {
  initial: GalleryListResult;
}

type FormState = { mode: "create" } | { mode: "edit"; item: GalleryItemData } | null;

interface GalleryErrorsResult {
  errors?: Record<string, string>;
  error?: string;
}

interface ActiveFilters {
  search: string;
  visibility: "all" | "visible" | "hidden";
  featured: "all" | "featured" | "regular";
}

function matchesFilters(item: GalleryItemData, filters: ActiveFilters): boolean {
  if (filters.visibility === "visible" && !item.visible) return false;
  if (filters.visibility === "hidden" && item.visible) return false;
  if (filters.featured === "featured" && !item.featured) return false;
  if (filters.featured === "regular" && item.featured) return false;
  const q = filters.search.trim().toLowerCase();
  if (q && !item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
    return false;
  }
  return true;
}

/** Canonical public order: featured first, then display order, then id. */
function compareGallery(a: GalleryItemData, b: GalleryItemData): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
  return a.id - b.id;
}

export function GalleryManager({ initial }: GalleryManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [featured, setFeatured] = useState<"all" | "featured" | "regular">("all");
  const [data, setData] = useState<GalleryListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hintDismissed = useSyncExternalStore(subscribeHint, getHintSnapshot, getHintServerSnapshot);

  const dismissHint = useCallback(() => {
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, "1");
    } catch {
      /* in-memory only */
    }
    for (const listener of hintListeners) listener();
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLoading(true);
  }, []);

  const refreshInBackground = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/gallery?page=1&pageSize=${PAGE_SIZE}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the gallery." });
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
    () => data.items.filter((item) => matchesFilters(item, filters)).sort(compareGallery),
    [data.items, filters]
  );

  const hasFilters = Boolean(searchInput || visibility !== "all" || featured !== "all");

  const handleSave = useCallback(
    async (input: GalleryItemInput): Promise<GalleryErrorsResult> => {
      const editing = formState?.mode === "edit";
      const url = editing ? `/api/gallery/${formState.item.id}` : "/api/gallery";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { errors: payload?.errors, error: payload?.error ?? "Something went wrong." };
      }

      let toastMessage = editing ? "Photo updated." : "Photo added.";
      if (!editing && payload?.item) {
        const created = payload.item as GalleryItemData;
        if (matchesFilters(created, filters)) {
          setData((prev) => {
            if (prev.items.some((i) => i.id === created.id)) return prev;
            const next = [...prev.items, created].sort(compareGallery);
            return { ...prev, items: next, total: prev.total + 1 };
          });
        } else {
          toastMessage = "Photo added successfully. It is hidden by the current filters.";
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
    async (item: GalleryItemData, patch: { visible?: boolean; featured?: boolean }) => {
      const updated = { ...item, ...patch };
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)),
      }));
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not update the photo." });
        return;
      }
      const saved = payload.item as GalleryItemData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)).sort(compareGallery),
      }));
      setToast({ type: "success", message: "Photo updated." });
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/gallery/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the photo." });
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
    setToast({ type: "success", message: "Photo deleted." });
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

      const res = await fetch("/api/gallery/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map(({ id, displayOrder }) => ({ id, displayOrder })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not reorder the gallery." });
        return;
      }
      refreshInBackground();
      setToast({ type: "success", message: "Gallery order updated." });
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
      <GalleryToolbar
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

      {!hintDismissed && (
        <div className="flex items-center gap-2 rounded-lg border border-[#C9A15C]/20 bg-[#231C17] px-3 py-2 text-[0.72rem] leading-snug text-white/60">
          <span className="min-w-0 flex-1">
            Drag a photo&rsquo;s handle to reorder it. Featured photos stay pinned first.
          </span>
          <button
            type="button"
            onClick={dismissHint}
            aria-label="Dismiss hint"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon size={13} />
          </button>
        </div>
      )}

      {visibleItems.length === 0 && !loading ? (
        <GalleryEmptyState
          hasFilters={hasFilters}
          onAdd={() => setFormState({ mode: "create" })}
          onClear={clearFilters}
        />
      ) : (
        <GalleryGrid
          items={visibleItems}
          loading={loading}
          onEdit={(item) => setFormState({ mode: "edit", item })}
          onDelete={setDeleteTarget}
          onToggle={handleToggle}
          onReorder={handleReorder}
        />
      )}

      {formState && (
        <GalleryItemForm
          mode={formState.mode}
          item={formState.mode === "edit" ? formState.item : null}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <GalleryDeleteModal
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
