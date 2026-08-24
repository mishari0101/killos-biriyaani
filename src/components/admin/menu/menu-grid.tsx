"use client";

import Image from "next/image";
import { PencilIcon, StarFilledIcon, StarIcon, TrashIcon } from "@/components/ui/icons";
import { isManagedImageUrl } from "@/lib/uploads/client";
import type { MenuItemData } from "@/lib/menu/types";

interface MenuGridProps {
  items: MenuItemData[];
  loading: boolean;
  onEdit: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
  onToggle: (item: MenuItemData, patch: { available?: boolean; featured?: boolean }) => void;
}

/** Card grid alternative to the table — same data, friendlier for browsing photos. */
export function MenuGrid({ items, loading, onEdit, onDelete, onToggle }: MenuGridProps) {
  return (
    <div
      className={`relative grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
        loading ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="admin-card group flex cursor-pointer flex-col overflow-hidden !p-0"
          onClick={() => onEdit(item)}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--admin-field-bg)]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                unoptimized={isManagedImageUrl(item.imageUrl)}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[0.75rem] text-[var(--admin-fg-muted)]">
                No photo
              </span>
            )}

            {!item.available && (
              <span className="absolute left-3 top-3 rounded-full bg-[#1a1a1a]/80 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-white">
                Hidden
              </span>
            )}
            {item.featured && (
              <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[#1a1a1a]">
                Featured
              </span>
            )}

            <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Edit ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1a1a1a]/85 text-white transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <PencilIcon size={13} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-[#1a1a1a]/85 text-white transition-colors hover:border-[var(--brand-cta)] hover:text-[var(--brand-cta)]"
              >
                <TrashIcon size={13} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 flex-1 truncate font-serif text-[1rem] font-semibold text-[var(--admin-fg)]">
                {item.name}
              </h3>
              <p className="shrink-0 text-[0.9rem] font-semibold tabular-nums text-[var(--admin-fg)]">
                RS {item.price.toFixed(2)}
              </p>
            </div>

            <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
              {item.category}
            </p>

            {(item.tags?.length ?? 0) > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[var(--admin-border)] px-2 py-0.5 text-[0.65rem] text-[var(--admin-fg-soft)]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex items-center justify-between pt-2">
              <button
                type="button"
                role="switch"
                aria-checked={item.available}
                aria-label={item.available ? `Mark ${item.name} unavailable` : `Mark ${item.name} available`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item, { available: !item.available });
                }}
                className="group/sw flex cursor-pointer items-center gap-2"
              >
                <span className="admin-toggle" data-on={item.available} aria-hidden="true">
                  <span className="admin-toggle-thumb" />
                </span>
                <span
                  className={`text-[0.72rem] font-medium ${
                    item.available ? "text-[var(--admin-fg)]" : "text-[var(--admin-fg-muted)]"
                  }`}
                >
                  {item.available ? "Active" : "Inactive"}
                </span>
              </button>

              <button
                type="button"
                aria-label={item.featured ? `Unfeature ${item.name}` : `Feature ${item.name}`}
                title={item.featured ? "Featured" : "Feature this item"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item, { featured: !item.featured });
                }}
                className={`cursor-pointer rounded-full p-1.5 transition-colors ${
                  item.featured
                    ? "text-[var(--accent)] hover:bg-[var(--admin-nav-active-bg)]"
                    : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-nav-active-bg)] hover:text-[var(--admin-fg)]"
                }`}
              >
                {item.featured ? <StarFilledIcon size={15} /> : <StarIcon size={15} />}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
