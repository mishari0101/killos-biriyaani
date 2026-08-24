"use client";

import { PlusIcon, SearchIcon } from "@/components/ui/icons";

interface GalleryToolbarProps {
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

export function GalleryToolbar({
  search,
  onSearch,
  visibility,
  onVisibility,
  featured,
  onFeatured,
  total,
  loading,
  onAdd,
}: GalleryToolbarProps) {
  const visibilitySelect = (
    <select
      value={visibility}
      onChange={(e) => onVisibility(e.target.value as typeof visibility)}
      className="admin-input h-10 w-full cursor-pointer text-[0.85rem] max-sm:!py-2"
      aria-label="Filter by visibility"
    >
      <option value="all">All</option>
      <option value="visible">Visible</option>
      <option value="hidden">Hidden</option>
    </select>
  );

  const featuredSelect = (
    <select
      value={featured}
      onChange={(e) => onFeatured(e.target.value as typeof featured)}
      className="admin-input h-10 w-full cursor-pointer text-[0.85rem] max-sm:!py-2"
      aria-label="Filter by featured"
    >
      <option value="all">All</option>
      <option value="featured">Featured</option>
      <option value="regular">Regular</option>
    </select>
  );

  return (
    <div className="admin-card overflow-hidden max-sm:p-3 sm:px-7 sm:py-5">
      {/* Mobile — two compact rows + inline count */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search photos…"
              aria-label="Search gallery photos"
              className="admin-input h-10 pl-10 !pr-3"
            />
          </div>
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add photo"
            title="Add photo"
            className="admin-btn admin-btn-primary h-10 w-10 shrink-0 !px-0"
          >
            <PlusIcon size={17} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.12em] leading-none text-[var(--admin-fg-muted)]">
              Visibility
            </span>
            {visibilitySelect}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.12em] leading-none text-[var(--admin-fg-muted)]">
              Featured
            </span>
            {featuredSelect}
          </label>
        </div>

        <p
          className="mt-2 text-right text-[0.68rem] leading-none tabular-nums text-[var(--admin-fg-muted)]"
          aria-live="polite"
        >
          {loading ? "Loading…" : `${total} photo${total === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Desktop — existing layout, minus the permanent drag & drop box */}
      <div className="hidden flex-col gap-4 sm:flex">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-fg-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search photos…"
              aria-label="Search gallery photos"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} photo${total === 1 ? "" : "s"}`}
            </span>
            <button type="button" onClick={onAdd} className="admin-btn admin-btn-primary">
              <PlusIcon size={16} />
              Add photo
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Visibility</span>
            {visibilitySelect}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Featured</span>
            {featuredSelect}
          </label>
        </div>
      </div>
    </div>
  );
}
