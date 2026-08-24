"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isManagedImageUrl } from "@/lib/uploads/client";
import {
  CopyIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { MenuItemData } from "@/lib/menu/types";

interface MenuTableProps {
  items: MenuItemData[];
  loading: boolean;
  onEdit: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
  onDuplicate: (item: MenuItemData) => void;
  onToggle: (item: MenuItemData, patch: { available?: boolean; featured?: boolean }) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Compact availability switch used inside table rows. */
function AvailabilitySwitch({
  item,
  onToggle,
}: {
  item: MenuItemData;
  onToggle: MenuTableProps["onToggle"];
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={item.available}
      aria-label={`${item.name} availability`}
      title={item.available ? "Active — shown on the site" : "Inactive — hidden from the site"}
      onClick={() => onToggle(item, { available: !item.available })}
      className="inline-flex cursor-pointer items-center gap-2"
    >
      <span className="admin-toggle" data-on={item.available} aria-hidden="true">
        <span className="admin-toggle-thumb" />
      </span>
      <span
        className={`text-[0.75rem] font-medium ${
          item.available ? "text-[var(--admin-fg)]" : "text-[var(--admin-fg-muted)]"
        }`}
      >
        {item.available ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

/** Three-dot row actions menu — Edit / Duplicate / Delete. */
function RowActions({
  item,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  item: MenuItemData;
  onEdit: MenuTableProps["onEdit"];
  onDelete: MenuTableProps["onDelete"];
  onDuplicate: MenuTableProps["onDuplicate"];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative md:flex md:justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${item.name}`}
        aria-expanded={open}
        className={`admin-icon-btn flex h-9 w-9 cursor-pointer items-center justify-center ${
          open ? "!border-[var(--accent)] text-[var(--accent-strong)]" : ""
        }`}
      >
        <MoreHorizontalIcon size={16} />
      </button>

      {open && (
        <div className="admin-card absolute right-0 top-11 z-30 w-44 overflow-hidden !rounded-xl p-1.5">
          {(
            [
              {
                label: "Edit",
                Icon: PencilIcon,
                action: () => onEdit(item),
                className: "",
              },
              {
                label: "Duplicate",
                Icon: CopyIcon,
                action: () => onDuplicate(item),
                className: "",
              },
            ] as const
          ).map(({ label, Icon, action, className }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setOpen(false);
                action();
              }}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.82rem] text-[var(--admin-fg-soft)] transition-colors hover:bg-[var(--admin-nav-active-bg)] hover:text-[var(--admin-fg)] ${className}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          <div className="mx-2 my-1 h-px bg-[var(--admin-border)]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(item);
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.82rem] text-[var(--brand-cta)] transition-colors hover:bg-[var(--brand-cta)]/10"
          >
            <TrashIcon size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function MenuTable({ items, loading, onEdit, onDelete, onDuplicate, onToggle }: MenuTableProps) {
  return (
    <div className="admin-card relative hidden overflow-hidden md:block">
      <div className="admin-table-scroll overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="hidden grid-cols-[2.4fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-6 py-3 md:grid">
            <span className="admin-table-th">Item</span>
            <span className="admin-table-th">Price</span>
            <span className="admin-table-th">Status</span>
            <span className="admin-table-th">Featured</span>
            <span className="admin-table-th">Order</span>
            <span className="admin-table-th text-right">Actions</span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="group grid grid-cols-1 gap-4 border-b border-[var(--admin-border)] px-6 py-5 last:border-b-0 hover:bg-[color-mix(in_srgb,var(--admin-nav-active-bg)_45%,transparent)] md:grid-cols-[2.4fr_1fr_1fr_0.8fr_0.8fr_auto] md:items-center md:gap-3"
            >
              {/* Item */}
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized={isManagedImageUrl(item.imageUrl)}
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
                  {(item.tags?.length ?? 0) > 0 && (
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-[var(--admin-border)] px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] text-[var(--admin-fg-soft)]"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                    {item.description || "No description yet."}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Price</span>
                <span className="text-[0.92rem] font-semibold tabular-nums text-[var(--admin-fg)]">
                  RS {formatPrice(item.price)}
                </span>
              </div>

              {/* Availability switch */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Status</span>
                <AvailabilitySwitch item={item} onToggle={onToggle} />
              </div>

              {/* Featured */}
              <div>
                <span className="admin-table-th mb-1 block md:hidden">Featured</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.featured}
                  aria-label={`${item.name} featured`}
                  title={item.featured ? "Featured" : "Feature this item"}
                  onClick={() => onToggle(item, { featured: !item.featured })}
                  className={`cursor-pointer rounded-full p-1.5 transition-colors ${
                    item.featured
                      ? "text-[var(--accent)] hover:bg-[var(--admin-nav-active-bg)]"
                      : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-nav-active-bg)] hover:text-[var(--admin-fg)]"
                  }`}
                >
                  {item.featured ? <StarFilledIcon size={16} /> : <StarIcon size={16} />}
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
              <div className="md:min-h-9">
                <span className="admin-table-th mb-1 block md:hidden">Actions</span>
                <RowActions item={item} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
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
