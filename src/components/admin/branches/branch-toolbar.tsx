"use client";

import { PlusIcon, SearchIcon } from "@/components/ui/icons";

interface BranchToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  visibility: "all" | "visible" | "hidden";
  onVisibility: (value: "all" | "visible" | "hidden") => void;
  featured: "all" | "featured" | "regular";
  onFeatured: (value: "all" | "featured" | "regular") => void;
  total: number;
  loading: boolean;
  onAdd: () => void;
}

export function BranchToolbar({
  search,
  onSearch,
  visibility,
  onVisibility,
  featured,
  onFeatured,
  total,
  loading,
  onAdd,
}: BranchToolbarProps) {
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
              placeholder="Search branches…"
              aria-label="Search branches"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} branch${total === 1 ? "" : "es"}`}
            </span>
            <button type="button" onClick={onAdd} className="admin-btn admin-btn-primary">
              <PlusIcon size={16} />
              Add branch
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Visibility</span>
            <select
              value={visibility}
              onChange={(e) => onVisibility(e.target.value as typeof visibility)}
              className="admin-input cursor-pointer"
              aria-label="Filter by visibility"
            >
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Head branch</span>
            <select
              value={featured}
              onChange={(e) => onFeatured(e.target.value as typeof featured)}
              className="admin-input cursor-pointer"
              aria-label="Filter by head branch"
            >
              <option value="all">All</option>
              <option value="featured">Head branch</option>
              <option value="regular">Regular</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Drag &amp; drop</span>
            <span className="admin-input flex items-center gap-2 bg-[var(--admin-field-bg)] text-[0.78rem] text-[var(--admin-fg-muted)]">
              Drag a card&rsquo;s handle to reorder it. The head branch stays pinned first.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
