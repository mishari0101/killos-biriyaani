"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import Image from "next/image";
import {
  CheckCircleIcon,
  EyeIcon,
  GoogleIcon,
  MenuIcon,
  PencilIcon,
  StarFilledIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { isManagedImageUrl } from "@/lib/uploads/client";
import type { ReviewData } from "@/lib/reviews/types";

interface ReviewGridProps {
  items: ReviewData[];
  loading: boolean;
  onEdit: (item: ReviewData) => void;
  onDelete: (item: ReviewData) => void;
  onToggle: (item: ReviewData, patch: { visible?: boolean; featured?: boolean }) => void;
  onReorder: (sourceId: number, targetId: number) => void;
}

function Avatar({ name, image }: { name: string; image: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={40}
        height={40}
        unoptimized={isManagedImageUrl(image)}
        sizes="40px"
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[var(--admin-border-strong)]"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[0.8rem] font-bold tracking-[0.02em] text-[var(--accent)]">
      {initials}
    </span>
  );
}

function ReviewCard({
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
  item: ReviewData;
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
        className="relative cursor-grab active:cursor-grabbing p-5 sm:p-6"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <span
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)] ring-1 ring-[var(--admin-border)]"
          title="Drag to reorder"
          aria-label={`Drag to reorder ${item.name}`}
        >
          <MenuIcon size={15} />
        </span>

        <div className="flex items-start justify-between gap-4 pr-10">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={item.name} image={item.imageUrl} />
            <div className="min-w-0">
              <h3 className="truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
                {item.name}
              </h3>
              <p className="mt-0.5 text-[0.7rem] text-[var(--admin-fg-muted)]">
                {item.reviewDate || "Verified review"}
              </p>
            </div>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]">
            <GoogleIcon size={14} />
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarFilledIcon
              key={star}
              size={14}
              className={star <= item.rating ? "text-[var(--accent)]" : "text-[var(--admin-border-strong)]"}
            />
          ))}
          <span className="ml-1.5 text-[0.74rem] font-medium tabular-nums text-[var(--admin-fg-muted)]">
            {item.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-[0.8rem] leading-relaxed text-[var(--admin-fg-soft)]">
          {item.text || "No review text yet."}
        </p>

        {!item.visible && (
          <span className="mt-3 inline-flex rounded-full border border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
            Hidden
          </span>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-3">
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

export function ReviewGrid({
  items,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
}: ReviewGridProps) {
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
          <ReviewCard
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
