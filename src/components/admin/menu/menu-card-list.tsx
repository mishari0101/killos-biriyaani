"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CopyIcon,
  ImageIcon,
  MoreHorizontalIcon,
  PencilIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { isManagedImageUrl } from "@/lib/uploads/client";
import type { MenuItemData } from "@/lib/menu/types";

interface MenuCardListProps {
  items: MenuItemData[];
  loading: boolean;
  onEdit: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
  onDuplicate: (item: MenuItemData) => void;
  onToggle: (item: MenuItemData, patch: { available?: boolean; featured?: boolean }) => void;
}

/** How far the card slides left when fully swiped open (Edit + Delete = 2 × 48px). */
const OPEN_X = -96;

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Compact single-row card list for phones (<md). One horizontal card per dish:
 * thumbnail · name/category/description/price · star/toggle/actions stack.
 * Swipe left reveals Edit/Delete; the ⋯ button offers the same plus Duplicate.
 */
export function MenuCardList({ items, loading, onEdit, onDelete, onDuplicate, onToggle }: MenuCardListProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; dx: number } | null>(null);
  const startRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const horizontalRef = useRef(false);

  const closeAll = () => {
    setOpenId(null);
    setMenuId(null);
  };

  return (
    <ul
      className={`flex flex-col gap-3 transition-opacity ${
        loading ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {items.map((item) => {
        const offset =
          drag?.id === item.id ? drag.dx : openId === item.id ? OPEN_X : 0;

        return (
          <li
            key={item.id}
            className="relative"
            style={menuId === item.id ? { zIndex: 40 } : undefined}
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#231C17]">
              {/* Revealed swipe actions (underneath, right edge) */}
              <div className="absolute inset-y-0 right-0 flex">
                <button
                  type="button"
                  aria-label={`Edit ${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAll();
                    onEdit(item);
                  }}
                  className="flex h-full w-12 cursor-pointer items-center justify-center bg-[#2E2620] text-[#C9A15C] transition-colors hover:bg-[#3A2F26]"
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeAll();
                    onDelete(item);
                  }}
                  className="flex h-full w-12 cursor-pointer items-center justify-center bg-[#4A201C] text-[#F87171] transition-colors hover:bg-[#5C2621]"
                >
                  <TrashIcon size={16} />
                </button>
              </div>

              {/* Foreground card */}
              <div
                className={`relative flex min-h-[84px] touch-pan-y select-none items-center gap-3 px-3 py-2 ${
                  drag?.id === item.id ? "" : "transition-transform duration-200 ease-out"
                }`}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  startRef.current = { id: item.id, x: t.clientX, y: t.clientY };
                  horizontalRef.current = false;
                  if (menuId && menuId !== item.id) setMenuId(null);
                  if (openId && openId !== item.id) setOpenId(null);
                }}
                onTouchMove={(e) => {
                  const s = startRef.current;
                  if (!s || s.id !== item.id) return;
                  const t = e.touches[0];
                  const dx = t.clientX - s.x;
                  const dy = t.clientY - s.y;
                  if (!horizontalRef.current) {
                    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
                    if (Math.abs(dx) <= Math.abs(dy)) {
                      startRef.current = null;
                      return;
                    }
                    horizontalRef.current = true;
                  }
                  const base = openId === item.id ? OPEN_X : 0;
                  setDrag({ id: item.id, dx: Math.max(-132, Math.min(0, base + dx)) });
                }}
                onTouchEnd={() => {
                  if (startRef.current?.id === item.id && horizontalRef.current && drag?.id === item.id) {
                    setOpenId(drag.dx < OPEN_X / 2 ? item.id : null);
                  }
                  startRef.current = null;
                  horizontalRef.current = false;
                  setDrag(null);
                }}
                onTouchCancel={() => {
                  startRef.current = null;
                  horizontalRef.current = false;
                  setDrag(null);
                }}
              >
                {/* Thumbnail */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      unoptimized={isManagedImageUrl(item.imageUrl)}
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>

                {/* Name · category · description · price */}
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="min-w-0 truncate text-base font-semibold leading-tight text-white">
                      {item.name}
                    </h3>
                    <span className="shrink-0 rounded-full border border-white/15 px-1.5 py-px text-[10px] uppercase tracking-[0.08em] leading-relaxed text-white/45">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs leading-snug text-white/40">
                    {item.description || "No description yet."}
                  </p>
                  <p className="mt-1.5 text-[15px] font-bold leading-none tabular-nums text-[#C9A15C]">
                    RS {formatPrice(item.price)}
                  </p>
                </div>

                {/* Star · toggle · actions stack */}
                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.featured}
                    aria-label={item.featured ? `Unfeature ${item.name}` : `Feature ${item.name}`}
                    title={item.featured ? "Featured" : "Feature this item"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item, { featured: !item.featured });
                    }}
                    className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors ${
                      item.featured
                        ? "text-[#C9A15C]"
                        : "text-white/35 hover:text-white/70"
                    }`}
                  >
                    {item.featured ? <StarFilledIcon size={13} /> : <StarIcon size={13} />}
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.available}
                    aria-label={item.available ? `Mark ${item.name} unavailable` : `Mark ${item.name} available`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item, { available: !item.available });
                    }}
                    className="flex cursor-pointer items-center"
                  >
                    <span className="admin-toggle admin-toggle-sm" data-on={item.available} aria-hidden="true">
                      <span className="admin-toggle-thumb" />
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-label={`Actions for ${item.name}`}
                    aria-expanded={menuId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenId(null);
                      setMenuId((v) => (v === item.id ? null : item.id));
                    }}
                    className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors ${
                      menuId === item.id
                        ? "text-white"
                        : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    <MoreHorizontalIcon size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ⋯ popover — anchored below the dots, above following cards */}
            {menuId === item.id && (
              <div className="absolute right-3 top-[calc(100%-6px)] z-50 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#231C17] p-1 shadow-xl shadow-black/40">
                {(
                  [
                    {
                      label: "Edit",
                      Icon: PencilIcon,
                      action: () => onEdit(item),
                      className: "text-white/75 hover:bg-white/5 hover:text-white",
                    },
                    {
                      label: "Duplicate",
                      Icon: CopyIcon,
                      action: () => onDuplicate(item),
                      className: "text-white/75 hover:bg-white/5 hover:text-white",
                    },
                  ] as const
                ).map(({ label, Icon, action, className }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      closeAll();
                      action();
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.82rem] transition-colors ${className}`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
                <div className="mx-2 my-1 h-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    closeAll();
                    onDelete(item);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.82rem] text-[#F87171] transition-colors hover:bg-[#4A201C]/60"
                >
                  <TrashIcon size={14} />
                  Delete
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
