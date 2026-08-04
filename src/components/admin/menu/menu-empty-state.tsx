"use client";

import { PlusIcon, RefreshIcon, UtensilsIcon } from "@/components/ui/icons";

interface EmptyStateProps {
  hasFilters: boolean;
  onAdd: () => void;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onAdd, onClear }: EmptyStateProps) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="admin-placeholder-grid relative flex flex-col items-center justify-center px-6 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 60% at 50% 0%, var(--accent-soft), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--accent)] shadow-[var(--admin-shadow)]">
            <UtensilsIcon size={26} />
          </div>
        </div>

        <h2 className="relative mt-6 font-serif text-xl font-semibold text-[var(--admin-fg)]">
          {hasFilters ? "No matching items" : "No menu items yet"}
        </h2>
        <p className="relative mt-2 max-w-md text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
          {hasFilters
            ? "Try clearing your filters or search to see the full menu."
            : "Add your first dish to start building the menu the site displays."}
        </p>

        <div className="relative mt-8 flex items-center gap-3">
          {hasFilters ? (
            <button type="button" onClick={onClear} className="admin-btn admin-btn-ghost">
              <RefreshIcon size={16} />
              Clear filters
            </button>
          ) : (
            <button type="button" onClick={onAdd} className="admin-btn admin-btn-primary">
              <PlusIcon size={16} />
              Add your first item
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
