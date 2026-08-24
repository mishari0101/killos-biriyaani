"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon, ListIcon, GridIcon, SearchIcon } from "@/components/ui/icons";
import type { MenuSort } from "@/lib/menu/types";
import type { ViewMode } from "./menu-manager";

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
  view: ViewMode;
  onView: (view: ViewMode) => void;
}

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
  view,
  onView,
}: MenuToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const extraFilterCount = useMemo(
    () => (availability !== "all" ? 1 : 0) + (featured !== "all" ? 1 : 0) + (sort !== "order" ? 1 : 0),
    [availability, featured, sort]
  );

  const viewToggle = (
    <div className="flex shrink-0 items-center rounded-full border border-[var(--admin-border)] p-1">
      {(
        [
          { key: "list", label: "List view", Icon: ListIcon },
          { key: "grid", label: "Grid view", Icon: GridIcon },
        ] as const
      ).map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onView(key)}
          aria-label={label}
          aria-pressed={view === key}
          title={label}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
            view === key
              ? "bg-[var(--admin-nav-active-bg)] text-[var(--accent-strong)]"
              : "text-[var(--admin-fg-muted)] hover:text-[var(--admin-fg)]"
          }`}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );

  const filtersButton = (compact: boolean) => (
    <button
      type="button"
      onClick={() => setMoreOpen((v) => !v)}
      aria-expanded={moreOpen}
      className={`admin-btn admin-btn-ghost relative shrink-0 !rounded-full text-[0.82rem] ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-2.5"
      } ${moreOpen || extraFilterCount > 0 ? "!border-[var(--accent)]/60 !text-[var(--admin-fg)]" : ""}`}
    >
      Filters
      {extraFilterCount > 0 && (
        <span className="flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.65rem] font-semibold leading-none text-[#1a1a1a]">
          {extraFilterCount}
        </span>
      )}
      <ChevronDownIcon
        size={14}
        className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
      />
    </button>
  );

  const searchField = (
    <div className="relative min-w-[12rem] flex-1">
      <SearchIcon
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
      />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search items…"
        aria-label="Search menu items"
        className="admin-input !rounded-full pl-10"
      />
    </div>
  );

  const categorySelect = (
    <select
      value={category}
      onChange={(e) => onCategory(e.target.value)}
      aria-label="Filter by category"
      className="admin-input w-auto cursor-pointer !rounded-full !py-2.5 pr-9 text-[0.85rem]"
    >
      <option value="all">All categories</option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );

  return (
    <div className="admin-card p-4 max-md:sticky max-md:top-16 max-md:z-20 max-md:px-3 max-md:py-2">
      {/* Mobile — one compact sticky row: Filters · view toggle · count */}
      <div className="flex items-center gap-2 md:hidden">
        {filtersButton(true)}
        {viewToggle}
        <span
          className="ml-auto shrink-0 pl-1 text-right text-[11px] tabular-nums leading-tight text-[var(--admin-fg-muted)]"
          aria-live="polite"
        >
          {loading ? "…" : `${total} item${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Desktop — full toolbar row */}
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        {searchField}
        {categorySelect}
        {filtersButton(false)}
        <div className="ml-auto">{viewToggle}</div>
      </div>

      {moreOpen && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-[var(--admin-border)] pt-3 max-md:mt-2 max-md:pt-2 sm:grid-cols-3">
          <div className="[&>div]:w-full md:hidden">{searchField}</div>

          <div className="[&>select]:w-full md:hidden">{categorySelect}</div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              Availability
            </span>
            <select
              value={availability}
              onChange={(e) => onAvailability(e.target.value as typeof availability)}
              className="admin-input cursor-pointer !py-2.5 text-[0.85rem]"
            >
              <option value="all">All</option>
              <option value="available">Available only</option>
              <option value="unavailable">Unavailable only</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              Featured
            </span>
            <select
              value={featured}
              onChange={(e) => onFeatured(e.target.value as typeof featured)}
              className="admin-input cursor-pointer !py-2.5 text-[0.85rem]"
            >
              <option value="all">All</option>
              <option value="featured">Featured only</option>
              <option value="regular">Regular only</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              Sort by
            </span>
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as MenuSort)}
              className="admin-input cursor-pointer !py-2.5 text-[0.85rem]"
            >
              <option value="order">Display order</option>
              <option value="name">Name (A–Z)</option>
              <option value="price-asc">Price (low → high)</option>
              <option value="price-desc">Price (high → low)</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
        </div>
      )}

      <p
        className="mt-3 hidden text-[0.75rem] text-[var(--admin-fg-muted)] md:block"
        aria-live="polite"
      >
        {loading ? "Loading…" : `${total} item${total === 1 ? "" : "s"} found`}
      </p>
    </div>
  );
}
