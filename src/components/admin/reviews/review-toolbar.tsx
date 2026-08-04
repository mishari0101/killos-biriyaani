"use client";

import { PlusIcon, SearchIcon } from "@/components/ui/icons";

interface ReviewToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  visibility: "all" | "visible" | "hidden";
  onVisibility: (value: "all" | "visible" | "hidden") => void;
  featured: "all" | "featured" | "regular";
  onFeatured: (value: "all" | "featured" | "regular") => void;
  rating: "all" | "1" | "2" | "3" | "4" | "5";
  onRating: (value: "all" | "1" | "2" | "3" | "4" | "5") => void;
  total: number;
  loading: boolean;
  onAdd: () => void;
}

export function ReviewToolbar({
  search,
  onSearch,
  visibility,
  onVisibility,
  featured,
  onFeatured,
  rating,
  onRating,
  total,
  loading,
  onAdd,
}: ReviewToolbarProps) {
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
              placeholder="Search customers…"
              aria-label="Search customers"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} review${total === 1 ? "" : "s"}`}
            </span>
            <button type="button" onClick={onAdd} className="admin-btn admin-btn-primary">
              <PlusIcon size={16} />
              Add review
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
            <span className="admin-field-label">Rating</span>
            <select
              value={rating}
              onChange={(e) => onRating(e.target.value as typeof rating)}
              className="admin-input cursor-pointer"
              aria-label="Filter by rating"
            >
              <option value="all">All stars</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Drag &amp; drop</span>
            <span className="admin-input flex items-center gap-2 bg-[var(--admin-field-bg)] text-[0.78rem] text-[var(--admin-fg-muted)]">
              Drag a card&rsquo;s handle to reorder it. Featured cards stay pinned first.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
