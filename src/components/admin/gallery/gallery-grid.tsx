"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import Image from "next/image";
import { isManagedImageUrl } from "@/lib/uploads/client";
import {
  CheckCircleIcon,
  EyeIcon,
  GripVerticalIcon,
  ImageIcon,
  MenuIcon,
  PencilIcon,
  StarFilledIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { GalleryItemData } from "@/lib/gallery/types";

interface GalleryGridProps {
  items: GalleryItemData[];
  loading: boolean;
  onEdit: (item: GalleryItemData) => void;
  onDelete: (item: GalleryItemData) => void;
  onToggle: (item: GalleryItemData, patch: { visible?: boolean; featured?: boolean }) => void;
  onReorder: (sourceId: number, targetId: number) => void;
}

function GalleryCard({
  item,
  menuOpen,
  onMenuToggle,
  isDragging,
  isDropTarget,
  onEdit,
  onDelete,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  item: GalleryItemData;
  menuOpen: boolean;
  onMenuToggle: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (patch: { visible?: boolean; featured?: boolean }) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-[#C9A15C]/10 bg-[#231C17] shadow-[0_12px_32px_-20px_rgba(0,0,0,0.65)] transition-shadow ${
        isDragging ? "opacity-40" : ""
      } ${isDropTarget ? "ring-2 ring-[var(--accent)]" : ""}`}
    >
      {/* ---- 16:9 frame on mobile, 4:3 on desktop — sources crop uniformly ---- */}
      <div
        className="relative aspect-video cursor-grab overflow-hidden rounded-t-[12px] active:cursor-grabbing sm:aspect-[4/3]"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            unoptimized={isManagedImageUrl(item.imageUrl)}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2A211A] via-[#231C17] to-[#1A1410] text-[#C9A15C]/50">
            <ImageIcon size={24} />
          </div>
        )}

        {!item.visible && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/55 backdrop-blur-[1px]">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/80">
              Hidden
            </span>
          </div>
        )}

        {/* ---- Drag handle + Featured badge (top-left, drag passes through) ---- */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1.5">
          <span
            title="Drag to reorder"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12100D]/60 text-white/70 ring-1 ring-white/15 backdrop-blur-md"
          >
            <GripVerticalIcon size={13} />
          </span>
          {item.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A15C] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#1A1410] shadow-[0_6px_18px_-6px_rgba(201,161,92,0.6)]">
              <StarFilledIcon size={11} />
              Featured
            </span>
          )}
        </div>

        {/* ---- Options trigger ---- */}
        <button
          type="button"
          aria-label={`Options for ${item.title}`}
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#12100D]/60 text-white/75 ring-1 ring-white/15 backdrop-blur-md transition-colors duration-200 hover:bg-[#12100D]/80 hover:text-white"
        >
          <MenuIcon size={15} />
        </button>

        {/* ---- Options menu ---- */}
        {menuOpen && (
          <>
            <span
              aria-hidden="true"
              className="fixed inset-0 z-30 cursor-default"
              onClick={onMenuToggle}
            />
            <div
              role="menu"
              className="absolute right-3 top-12 z-40 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#231C17] py-1 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.7)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onMenuToggle();
                  onEdit();
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[0.78rem] font-medium text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <PencilIcon size={13} />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onMenuToggle();
                  onDelete();
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[0.78rem] font-medium text-[#E5484D] transition-colors hover:bg-[#E5484D]/10"
              >
                <TrashIcon size={13} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* ---- Uniform body: name+ID / description / divider / status row ---- */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[0.95rem] font-bold leading-tight text-white">
            {item.title}
          </h3>
          <span className="shrink-0 text-[0.7rem] tabular-nums text-white/45">
            #{String(item.displayOrder).padStart(2, "0")}
          </span>
        </div>

        {/* Fixed-height description slot keeps every card identical */}
        <div className="mt-1.5 min-h-[19px]">
          {item.description ? (
            <p className="truncate text-[0.76rem] leading-[19px] text-white/55" title={item.description}>
              {item.description}
            </p>
          ) : (
            <p className="truncate text-[0.76rem] italic leading-[19px] text-white/35">
              No description yet.
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={item.visible}
              aria-label={`${item.title} visibility`}
              onClick={() => onToggle({ visible: !item.visible })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                item.visible
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/15 bg-transparent text-white/45"
              }`}
            >
              {item.visible ? <CheckCircleIcon size={12} /> : <EyeIcon size={12} />}
              {item.visible ? "Visible" : "Hidden"}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={item.featured}
              aria-label={`${item.title} featured`}
              onClick={() => onToggle({ featured: !item.featured })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                item.featured
                  ? "border-[#C9A15C]/50 bg-[#C9A15C]/10 text-[#C9A15C]"
                  : "border-white/15 bg-transparent text-white/45"
              }`}
            >
              <StarFilledIcon size={12} />
              {item.featured ? "Featured" : "Regular"}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${item.title}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-200 hover:border-white/25 hover:text-white"
            >
              <PencilIcon size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${item.title}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-200 hover:border-[#E5484D]/60 hover:text-[#E5484D]"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({ items, loading, onEdit, onDelete, onToggle, onReorder }: GalleryGridProps) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [menuForId, setMenuForId] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: number) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverId((prev) => (prev === id ? prev : id));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    const sourceId = dragId ?? Number(e.dataTransfer.getData("text/plain"));
    setDragId(null);
    setOverId(null);
    if (sourceId && sourceId !== id) onReorder(sourceId, id);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#1A1410] p-3 sm:p-6 max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:p-0">
      <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            menuOpen={menuForId === item.id}
            onMenuToggle={() =>
              setMenuForId((prev) => (prev === item.id ? null : item.id))
            }
            isDragging={dragId === item.id}
            isDropTarget={overId === item.id && dragId !== item.id}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            onToggle={(patch) => onToggle(item, patch)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-[#1A1410]/40 pt-8 backdrop-blur-[1px]">
          <span className="rounded-full border border-white/10 bg-[#231C17] px-4 py-1.5 text-[0.75rem] text-white/70 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)]">
            Loading…
          </span>
        </div>
      )}
    </div>
  );
}
