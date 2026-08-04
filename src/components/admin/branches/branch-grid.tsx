"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import Image from "next/image";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  MenuIcon,
  PencilIcon,
  PhoneIcon,
  StarFilledIcon,
  StoreIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { BranchData } from "@/lib/branches/types";

interface BranchGridProps {
  items: BranchData[];
  loading: boolean;
  onEdit: (item: BranchData) => void;
  onDelete: (item: BranchData) => void;
  onToggle: (item: BranchData, patch: { visible?: boolean; featured?: boolean }) => void;
  onReorder: (sourceId: number, targetId: number) => void;
}

function formatHour(value: string): string {
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function hoursText(item: BranchData): string {
  const open = item.hours.filter((h) => !h.closed);
  if (open.length === 0) return "Closed";
  const earliest = Math.min(...open.map((h) => (parseInt(h.open.split(":")[0], 10) || 0) * 60 + (parseInt(h.open.split(":")[1], 10) || 0)));
  const latest = Math.max(...open.map((h) => (parseInt(h.close.split(":")[0], 10) || 0) * 60 + (parseInt(h.close.split(":")[1], 10) || 0)));
  const fmt = (mins: number) =>
    formatHour(`${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`);
  return `${fmt(earliest)} – ${fmt(latest)}`;
}

function BranchCard({
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
  item: BranchData;
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
        className="relative cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-28 w-full items-center justify-center overflow-hidden bg-[var(--admin-field-bg)]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={400}
              height={225}
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]">
              <StoreIcon size={22} />
            </span>
          )}
        </div>

        <span
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a]/60 text-white/90 backdrop-blur-sm"
          title="Drag to reorder"
          aria-label={`Drag to reorder ${item.name}`}
        >
          <MenuIcon size={15} />
        </span>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
                {item.name}
              </h3>
              <p className="mt-0.5 truncate text-[0.7rem] text-[var(--admin-fg-muted)]">
                {item.address}
              </p>
            </div>
            {item.featured && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
                <StarFilledIcon size={10} />
                Head
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2.5 text-[0.76rem] text-[var(--admin-fg-soft)]">
              <MapPinIcon size={13} className="shrink-0 text-[var(--accent)]" />
              <span className="truncate">{item.address}</span>
            </p>
            <p className="flex items-center gap-2.5 text-[0.76rem] text-[var(--admin-fg-soft)]">
              <PhoneIcon size={13} className="shrink-0 text-[var(--accent)]" />
              <span className="truncate">
                {[item.primaryPhone, item.secondaryPhone].filter(Boolean).join(" · ")}
              </span>
            </p>
            <p className="flex items-center gap-2.5 text-[0.76rem] text-[var(--admin-fg-soft)]">
              <ClockIcon size={13} className="shrink-0 text-[var(--accent)]" />
              <span className="truncate">{hoursText(item)}</span>
            </p>
          </div>

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
                aria-label={`${item.name} head branch`}
                onClick={() => onToggle({ featured: !item.featured })}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                  item.featured
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
                }`}
              >
                <StarFilledIcon size={12} />
                {item.featured ? "Head" : "Regular"}
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
    </div>
  );
}

export function BranchGrid({
  items,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
}: BranchGridProps) {
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
          <BranchCard
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
