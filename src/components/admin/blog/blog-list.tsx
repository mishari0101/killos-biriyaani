"use client";

import { useState } from "react";
import type { DragEvent } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  MenuIcon,
  PencilIcon,
  StarFilledIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { parseTags } from "@/lib/content/blog";
import type { BlogData } from "@/lib/blog/types";

interface BlogListProps {
  items: BlogData[];
  loading: boolean;
  onEdit: (item: BlogData) => void;
  onDelete: (item: BlogData) => void;
  onToggle: (item: BlogData, patch: { published?: boolean; featured?: boolean }) => void;
  onReorder: (sourceId: number, targetId: number) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BlogRow({
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
  item: BlogData;
  isDragging: boolean;
  isDropTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (patch: { published?: boolean; featured?: boolean }) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const tags = parseTags(item.tags).slice(0, 2);

  return (
    <div
      className={`group relative flex items-start gap-4 border-b border-[var(--admin-border)] p-5 transition-colors last:border-b-0 sm:px-6 ${
        isDragging ? "bg-[var(--admin-field-bg)] opacity-40" : ""
      } ${isDropTarget ? "bg-[var(--admin-field-bg)] ring-2 ring-inset ring-[var(--accent)]" : ""}`}
    >
      <div
        className="mt-0.5 cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        title="Drag to reorder"
        aria-label={`Drag to reorder ${item.title}`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)] ring-1 ring-[var(--admin-border)]">
          <MenuIcon size={15} />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 gap-4">
        <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-field-bg)] sm:block">
          {item.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--admin-fg-muted)]">
              <ClockIcon size={18} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pr-2">
            <h3 className="min-w-0 flex-1 truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)]">
              {item.title}
            </h3>
            {item.category && (
              <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--accent)]/35 bg-[var(--accent-soft)] px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--accent)]">
                {item.category}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 max-w-3xl text-[0.8rem] leading-relaxed text-[var(--admin-fg-soft)]">
            {item.excerpt}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {!item.published && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[var(--admin-fg-muted)]">
                <ClockIcon size={11} />
                Draft
              </span>
            )}
            {item.publishedAt && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-2.5 py-1 text-[0.62rem] text-[var(--admin-fg-muted)]">
                {formatDate(item.publishedAt)}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-[var(--admin-border)] px-2.5 py-1 text-[0.62rem] text-[var(--admin-fg-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={item.published}
              aria-label={`${item.title} published`}
              onClick={() => onToggle({ published: !item.published })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors ${
                item.published
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : "border-[var(--admin-border-strong)] bg-[var(--admin-card)] text-[var(--admin-fg-muted)]"
              }`}
            >
              {item.published ? <CheckCircleIcon size={12} /> : <ClockIcon size={12} />}
              {item.published ? "Published" : "Draft"}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={item.featured}
              aria-label={`${item.title} featured`}
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
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 self-start">
        {item.published && (
          <a
            href={`/blog/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${item.title} on the site`}
            title="View on the site"
            className="admin-icon-btn flex h-8 w-8 items-center justify-center"
          >
            <ExternalLinkIcon size={14} />
          </a>
        )}
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${item.title}`}
          className="admin-icon-btn flex h-8 w-8 items-center justify-center"
        >
          <PencilIcon size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${item.title}`}
          className="admin-icon-btn flex h-8 w-8 items-center justify-center text-[var(--brand-cta)] hover:border-[var(--brand-cta)]"
        >
          <TrashIcon size={14} />
        </button>
      </div>
    </div>
  );
}

export function BlogList({
  items,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
}: BlogListProps) {
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
      <div>
        {items.map((item) => (
          <BlogRow
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
