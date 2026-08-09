"use client";

import { useCallback, useEffect, useState } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { MenuToolbar } from "./menu-toolbar";
import { MenuTable } from "./menu-table";
import { MenuItemForm } from "./menu-item-form";
import { MenuDeleteModal } from "./menu-delete-modal";
import { EmptyState } from "./menu-empty-state";
import type {
  MenuItemData,
  MenuListResult,
  MenuSort,
} from "@/lib/menu/types";
import type { MenuItemInput } from "@/lib/menu/validate";

const PAGE_SIZE = 10;

interface MenuManagerProps {
  initial: MenuListResult;
}

type FormState =
  | { mode: "create" }
  | { mode: "edit"; item: MenuItemData }
  | null;

interface MenuItemErrorsResult {
  errors?: Record<string, string>;
  error?: string;
}

interface ActiveFilters {
  search: string;
  category: string;
  availability: "all" | "available" | "unavailable";
  featured: "all" | "featured" | "regular";
}

function matchesFilters(item: MenuItemData, filters: ActiveFilters): boolean {
  if (filters.category !== "all" && item.category !== filters.category) return false;
  if (filters.availability === "available" && !item.available) return false;
  if (filters.availability === "unavailable" && item.available) return false;
  if (filters.featured === "featured" && !item.featured) return false;
  if (filters.featured === "regular" && item.featured) return false;
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
      return false;
    }
  }
  return true;
}

function compareForSort(a: MenuItemData, b: MenuItemData, sort: MenuSort): number {
  switch (sort) {
    case "name":
      return a.name.localeCompare(b.name);
    case "price-asc":
      return a.price - b.price || a.name.localeCompare(b.name);
    case "price-desc":
      return b.price - a.price || a.name.localeCompare(b.name);
    case "newest":
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    case "order":
    default:
      return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
  }
}

export function MenuManager({ initial }: MenuManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [featured, setFeatured] = useState<"all" | "featured" | "regular">("all");
  const [sort, setSort] = useState<MenuSort>("order");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MenuListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItemData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      setLoading(true);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const changeFilter = useCallback((key: "category" | "availability" | "featured" | "sort", value: string) => {
    const unchanged =
      (key === "category" && value === category) ||
      (key === "availability" && value === availability) ||
      (key === "featured" && value === featured) ||
      (key === "sort" && value === sort);
    if (unchanged) return;
    if (key === "category") setCategory(value);
    else if (key === "availability") setAvailability(value as typeof availability);
    else if (key === "featured") setFeatured(value as typeof featured);
    else setSort(value as MenuSort);
    setPage(1);
    setLoading(true);
  }, [category, availability, featured, sort]);

  const goToPage = useCallback((next: number) => {
    if (next === page) return;
    setPage(next);
    setLoading(true);
  }, [page]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLoading(true);
  }, []);

  const refreshInBackground = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (availability !== "all") params.set("availability", availability);
    if (featured !== "all") params.set("featured", featured);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    fetch(`/api/menu?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the menu." });
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
  }, [search, category, availability, featured, sort, page, refreshKey]);

  const handleSave = useCallback(
    async (input: MenuItemInput): Promise<MenuItemErrorsResult> => {
      const editing = formState?.mode === "edit";
      const url = editing ? `/api/menu/${formState.item.id}` : "/api/menu";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { errors: payload?.errors, error: payload?.error ?? "Something went wrong." };
      }

      let toastMessage = editing ? "Menu item updated." : "Menu item added.";
      if (!editing && payload?.item) {
        const created = payload.item as MenuItemData;
        const visible = matchesFilters(created, { search, category, availability, featured });
        if (visible) {
          setData((prev) => {
            if (prev.items.some((i) => i.id === created.id)) return prev;
            const next = [...prev.items];
            const index = next.findIndex((i) => compareForSort(created, i, sort) < 0);
            if (index === -1) next.push(created);
            else next.splice(index, 0, created);
            return { ...prev, items: next, total: prev.total + 1 };
          });
        } else {
          toastMessage = "Menu item created successfully. It is hidden by the current filters.";
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
    [formState, refresh, refreshInBackground, search, category, availability, featured, sort]
  );

  const handleToggle = useCallback(
    async (item: MenuItemData, patch: { available?: boolean; featured?: boolean }) => {
      const updated = { ...item, ...patch };
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", message: payload?.error ?? "Could not update the item." });
        return;
      }
      refresh();
      setToast({ type: "success", message: "Menu item updated." });
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/menu/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the item." });
      setDeleting(false);
      return;
    }
    setDeleteTarget(null);
    setDeleting(false);
    refresh();
    setToast({ type: "success", message: "Menu item deleted." });
  }, [deleteTarget, deleting, refresh]);

  const categories = Array.from(
    new Set([...data.categories, ...(formState?.mode === "edit" ? [formState.item.category] : [])])
  ).sort((a, b) => a.localeCompare(b));

  const hasFilters = Boolean(search || category !== "all" || availability !== "all" || featured !== "all");

  return (
    <div className="space-y-6">
      <MenuToolbar
        search={searchInput}
        onSearch={setSearchInput}
        category={category}
        onCategory={(v) => changeFilter("category", v)}
        availability={availability}
        onAvailability={(v) => changeFilter("availability", v)}
        featured={featured}
        onFeatured={(v) => changeFilter("featured", v)}
        sort={sort}
        onSort={(v) => changeFilter("sort", v)}
        categories={data.categories}
        onAdd={() => setFormState({ mode: "create" })}
        total={data.total}
        loading={loading}
      />

      {data.items.length === 0 && !loading ? (
        <EmptyState
          hasFilters={hasFilters}
          onAdd={() => setFormState({ mode: "create" })}
          onClear={() => {
            setSearchInput("");
            setSearch("");
            setCategory("all");
            setAvailability("all");
            setFeatured("all");
            setSort("order");
            setPage(1);
          }}
        />
      ) : (
        <MenuTable
          items={data.items}
          loading={loading}
          onEdit={(item) => setFormState({ mode: "edit", item })}
          onDelete={setDeleteTarget}
          onToggle={handleToggle}
        />
      )}

      {data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-[0.78rem] text-[var(--admin-fg-muted)]">
            {data.total} item{data.total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="admin-btn admin-btn-ghost px-3 py-2 text-[0.78rem] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-[0.8rem] tabular-nums text-[var(--admin-fg-soft)]">
              {page} / {data.totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(data.totalPages, page + 1))}
              disabled={page >= data.totalPages || loading}
              className="admin-btn admin-btn-ghost px-3 py-2 text-[0.78rem] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {formState && (
        <MenuItemForm
          mode={formState.mode}
          item={formState.mode === "edit" ? formState.item : null}
          categories={categories}
          onClose={() => setFormState(null)}
          onSave={handleSave}
          onCategoryCreated={refreshInBackground}
        />
      )}

      {deleteTarget && (
        <MenuDeleteModal
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
