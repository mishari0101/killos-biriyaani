"use client";

import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import type { MenuSort } from "@/lib/menu/types";

interface MenuToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  availability: "all" | "available" | "unavailable";
  onAvailability: (value: "all" | "available" | "unavailable") => void;
  featured: "all" | "featured" | "regular";
  onFeatured: (value: "all" | "featured" | "regular") => void;
  sort: MenuSort;
  onSort: (value: MenuSort) => void;
  categories: string[];
  total: number;
  loading: boolean;
  onAdd: () => void;
}

const SORTS: { value: MenuSort; label: string }[] = [
  { value: "order", label: "Display order" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price-asc", label: "Price (low → high)" },
  { value: "price-desc", label: "Price (high → low)" },
  { value: "newest", label: "Newest first" },
];

export function MenuToolbar({
  search,
  onSearch,
  category,
  onCategory,
  availability,
  onAvailability,
  featured,
  onFeatured,
  sort,
  onSort,
  categories,
  total,
  loading,
  onAdd,
}: MenuToolbarProps) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-5 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search items…"
              aria-label="Search menu items"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} item${total === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={onAdd}
              className="admin-btn admin-btn-primary"
            >
              <PlusIcon size={16} />
              Add item
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Category</span>
            <select
              value={category}
              onChange={(e) => onCategory(e.target.value)}
              className="admin-input cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Availability</span>
            <select
              value={availability}
              onChange={(e) => onAvailability(e.target.value as typeof availability)}
              className="admin-input cursor-pointer"
              aria-label="Filter by availability"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Featured</span>
            <select
              value={featured}
              onChange={(e) => onFeatured(e.target.value as typeof featured)}
              className="admin-input cursor-pointer"
              aria-label="Filter by featured"
            >
              <option value="all">All</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as MenuSort)}
              className="admin-input cursor-pointer"
              aria-label="Sort menu items"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
