"use client";

import Image from "next/image";
import {
  CheckCircleIcon,
  EyeIcon,
  ImageIcon,
  PencilIcon,
  TrashIcon,
  StarFilledIcon,
} from "@/components/ui/icons";
import type { MenuItemData } from "@/lib/menu/types";

interface MenuTableProps {
  items: MenuItemData[];
  loading: boolean;
  onEdit: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
  onToggle: (item: MenuItemData, patch: { available?: boolean; featured?: boolean }) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MenuTable({ items, loading, onEdit, onDelete, onToggle }: MenuTableProps) {
  return (
    <div className="admin-card relative overflow-hidden">
      <div className="admin-table-scroll overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="hidden grid-cols-[2.4fr_1fr_0.9fr_1fr_1fr_auto] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-6 py-3 md:grid">
            <span className="admin-table-th">Item</span>
            <span className="admin-table-th">Price</span>
            <span className="admin-table-th">Availability</span>
            <span className="admin-table-th">Featured</span>
            <span className="admin-table-th">Order</span>
            <span className="admin-table-th text-right">Actions</span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="group grid grid-cols-1 gap-4 border-b border-[var(--admin-border)] px-6 py-5 last:border-b-0 md:grid-cols-[2.4fr_1fr_0.9fr_1fr_1fr_auto] md:items-center md:gap-3"
            >
              {/* Item */}
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--admin-fg-muted)]">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  {item.featured && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[#1a1a1a]">
                      <StarFilledIcon size={11} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-serif text-[1rem] font-semibold text-[var(--admin-fg)]">
                      {item.name}
                    </h3>
                    <span className="admin-chip">{item.category}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                    {item.description || "No description yet."}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Price</span>
                <span className="text-[0.92rem] font-semibold tabular-nums text-[var(--admin-fg)]">
                  SR {formatPrice(item.price)}
                </span>
              </div>

              {/* Availability */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Availability</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.available}
                  aria-label={`${item.name} availability`}
                  onClick={() => onToggle(item, { available: !item.available })}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-medium transition-colors ${
                    item.available
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
                  }`}
                >
                  {item.available ? <CheckCircleIcon size={13} /> : <EyeIcon size={13} />}
                  {item.available ? "Available" : "Unavailable"}
                </button>
              </div>

              {/* Featured */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Featured</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.featured}
                  aria-label={`${item.name} featured`}
                  onClick={() => onToggle(item, { featured: !item.featured })}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-medium transition-colors ${
                    item.featured
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
                  }`}
                >
                  <StarFilledIcon size={13} />
                  {item.featured ? "Featured" : "Regular"}
                </button>
              </div>

              {/* Display order */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Display order</span>
                <span className="text-[0.85rem] tabular-nums text-[var(--admin-fg-soft)]">
                  #{String(item.displayOrder).padStart(2, "0")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  className="admin-icon-btn flex h-9 w-9 items-center justify-center"
                >
                  <PencilIcon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  aria-label={`Delete ${item.name}`}
                  className="admin-icon-btn flex h-9 w-9 items-center justify-center text-[var(--brand-cta)] hover:border-[var(--brand-cta)]"
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-[var(--admin-bg)]/40 pt-8 backdrop-blur-[1px]">
          <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-1.5 text-[0.75rem] text-[var(--admin-fg-soft)] shadow-[var(--admin-shadow)]">
            Loading…
          </span>
        </div>
      )}
    </div>
  );
}
