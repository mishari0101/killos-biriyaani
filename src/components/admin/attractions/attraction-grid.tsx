"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import Image from "next/image";
import { isManagedImageUrl } from "@/lib/uploads/client";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ImageIcon,
  MapPinIcon,
  MenuIcon,
  PencilIcon,
  StarFilledIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { AttractionData } from "@/lib/attractions/types";

interface AttractionGridProps {
  items: AttractionData[];
  loading: boolean;
  onEdit: (item: AttractionData) => void;
  onDelete: (item: AttractionData) => void;
  onToggle: (item: AttractionData, patch: { visible?: boolean; featured?: boolean }) => void;
  onReorder: (sourceId: number, targetId: number) => void;
}

function AttractionCard({
  item,
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
  item: AttractionData;
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
      className={`admin-card group relative overflow-hidden transition-shadow ${
        isDragging ? "opacity-40" : ""
      } ${isDropTarget ? "ring-2 ring-[var(--accent)]" : ""}`}
    >
      <div
        className="relative aspect-[4/3] cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            unoptimized={isManagedImageUrl(item.imageUrl)}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]">
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

        {item.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] shadow-[var(--admin-shadow)]">
            <StarFilledIcon size={11} />
            Featured
          </span>
        )}

        <span
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15 backdrop-blur-md"
          title="Drag to reorder"
          aria-label={`Drag to reorder ${item.name}`}
        >
          <MenuIcon size={15} />
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
            {item.name}
          </h3>
          <span className="shrink-0 text-[0.7rem] tabular-nums text-[var(--admin-fg-muted)]">
            #{String(item.displayOrder).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[0.76rem] leading-relaxed text-[var(--admin-fg-soft)]">
          {item.description || "No description yet."}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-[var(--admin-fg-muted)]">
          <span className="inline-flex items-center gap-1">
            <StarFilledIcon size={11} className="text-[var(--accent)]" />
            {Number(item.rating).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={11} />
            {item.travelTime}
          </span>
          <span className="inline-flex max-w-[10rem] items-center gap-1 truncate">
            <MapPinIcon size={11} />
            <span className="truncate">Google Maps</span>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={item.visible}
              aria-label={`${item.name} visibility`}
              onClick={() => onToggle({ visible: !item.visible })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                item.visible
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
              }`}
            >
              {item.visible ? <CheckCircleIcon size={12} /> : <EyeIcon size={12} />}
              {item.visible ? "Visible" : "Hidden"}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={item.featured}
              aria-label={`${item.name} featured`}
              onClick={() => onToggle({ featured: !item.featured })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                item.featured
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
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
              aria-label={`Edit ${item.name}`}
              className="admin-icon-btn flex h-8 w-8 items-center justify-center"
            >
              <PencilIcon size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${item.name}`}
              className="admin-icon-btn flex h-8 w-8 items-center justify-center text-[var(--brand-cta)] hover:border-[var(--brand-cta)]"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttractionGrid({
  items,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
}: AttractionGridProps) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

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
    <div className="admin-card relative overflow-hidden">
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
        {items.map((item) => (
          <AttractionCard
            key={item.id}
            item={item}
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
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-[var(--admin-bg)]/40 pt-8 backdrop-blur-[1px]">
          <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-1.5 text-[0.75rem] text-[var(--admin-fg-soft)] shadow-[var(--admin-shadow)]">
            Loading…
          </span>
        </div>
      )}
    </div>
  );
}
