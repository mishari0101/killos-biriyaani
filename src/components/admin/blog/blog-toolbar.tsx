"use client";

import { PlusIcon, SearchIcon } from "@/components/ui/icons";

interface BlogToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  status: "all" | "published" | "draft";
  onStatus: (value: "all" | "published" | "draft") => void;
  featured: "all" | "featured" | "regular";
  onFeatured: (value: "all" | "featured" | "regular") => void;
  category: string;
  onCategory: (value: string) => void;
  categories: string[];
  total: number;
  loading: boolean;
  onAdd: () => void;
}

export function BlogToolbar({
  search,
  onSearch,
  status,
  onStatus,
  featured,
  onFeatured,
  category,
  onCategory,
  categories,
  total,
  loading,
  onAdd,
}: BlogToolbarProps) {
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
              placeholder="Search titles, content, tags…"
              aria-label="Search blog posts"
              className="admin-input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {loading ? "Loading…" : `${total} post${total === 1 ? "" : "s"}`}
            </span>
            <button type="button" onClick={onAdd} className="admin-btn admin-btn-primary">
              <PlusIcon size={16} />
              New post
            </button>
          </div>
        </div>

        <div className="admin-divider" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Status</span>
            <select
              value={status}
              onChange={(e) => onStatus(e.target.value as typeof status)}
              className="admin-input cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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
            <span className="admin-field-label">Category</span>
            <select
              value={category}
              onChange={(e) => onCategory(e.target.value)}
              className="admin-input cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-field-label">Drag &amp; drop</span>
            <span className="admin-input flex items-center gap-2 bg-[var(--admin-field-bg)] text-[0.78rem] text-[var(--admin-fg-muted)]">
              Drag a row&rsquo;s handle to reorder it. Featured posts stay pinned first.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
