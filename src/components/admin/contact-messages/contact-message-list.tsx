"use client";

import {
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import type {
  ContactMessageData,
  ContactMessageStatus,
} from "@/lib/contact-messages/types";

const STATUS_META: Record<
  ContactMessageStatus,
  { label: string; pill: string }
> = {
  NEW: {
    label: "New",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  READ: {
    label: "Read",
    pill: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  REPLIED: {
    label: "Replied",
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  CLOSED: {
    label: "Closed",
    pill: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
  },
  SPAM: {
    label: "Spam",
    pill: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
  },
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface StatusAction {
  next: ContactMessageStatus;
  label: string;
  tone: string;
  icon: typeof CheckIcon;
}

function statusActions(item: ContactMessageData): StatusAction[] {
  if (item.status === "NEW") {
    return [
      {
        next: "READ",
        label: "Read",
        tone: "border-sky-500/30 bg-sky-500/10 text-sky-600",
        icon: EyeIcon,
      },
      {
        next: "REPLIED",
        label: "Replied",
        tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        icon: CheckCircleIcon,
      },
      {
        next: "SPAM",
        label: "Spam",
        tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
        icon: CloseIcon,
      },
      {
        next: "CLOSED",
        label: "Close",
        tone: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
        icon: CheckIcon,
      },
    ];
  }
  if (item.status === "READ") {
    return [
      {
        next: "REPLIED",
        label: "Replied",
        tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        icon: CheckCircleIcon,
      },
      {
        next: "SPAM",
        label: "Spam",
        tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
        icon: CloseIcon,
      },
      {
        next: "CLOSED",
        label: "Close",
        tone: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
        icon: CheckIcon,
      },
    ];
  }
  if (item.status === "REPLIED") {
    return [
      {
        next: "CLOSED",
        label: "Close",
        tone: "border-[var(--admin-border-strong)] bg-[var(--admin-field-bg)] text-[var(--admin-fg-muted)]",
        icon: CheckIcon,
      },
      {
        next: "SPAM",
        label: "Spam",
        tone: "border-[var(--brand-cta)]/40 bg-[var(--brand-cta)]/10 text-[var(--brand-cta)]",
        icon: CloseIcon,
      },
    ];
  }
  return [];
}

interface ContactMessageListProps {
  items: ContactMessageData[];
  loading: boolean;
  onStatusChange: (item: ContactMessageData, status: ContactMessageStatus) => void;
  onView: (item: ContactMessageData) => void;
  onEditNotes: (item: ContactMessageData) => void;
  onDelete: (item: ContactMessageData) => void;
}

export function ContactMessageList({
  items,
  loading,
  onStatusChange,
  onView,
  onEditNotes,
  onDelete,
}: ContactMessageListProps) {
  return (
    <div className="admin-card relative overflow-hidden">
      <div className="admin-table-scroll overflow-x-auto">
        <div className="min-w-[1080px]">
          <div className="hidden grid-cols-[1.6fr_1.1fr_1fr_0.8fr_auto] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-field-bg)] px-6 py-3 lg:grid">
            <span className="admin-table-th">Message</span>
            <span className="admin-table-th">Customer</span>
            <span className="admin-table-th">Received</span>
            <span className="admin-table-th">Status</span>
            <span className="admin-table-th text-right">Actions</span>
          </div>

          {items.map((item) => {
            const meta = STATUS_META[item.status];
            const actions = statusActions(item);
            return (
              <div
                key={item.id}
                className="group grid grid-cols-1 gap-4 border-b border-[var(--admin-border)] px-6 py-5 last:border-b-0 lg:grid-cols-[1.6fr_1.1fr_1fr_0.8fr_auto] lg:items-center lg:gap-3"
              >
                {/* Message */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums tracking-[0.08em] text-[var(--accent)]">
                      {item.number}
                    </span>
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="truncate font-serif text-[0.95rem] font-semibold text-[var(--admin-fg)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
                      title={`Open ${item.number}`}
                    >
                      {item.subject}
                    </button>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
                    {item.message}
                  </p>
                  {item.notes && (
                    <p className="mt-1 text-[0.7rem] font-medium text-[var(--admin-fg-muted)]">
                      <span className="mr-1">•</span>Notes: {item.notes}
                    </p>
                  )}
                </div>

                {/* Customer */}
                <div className="space-y-1">
                  <span className="admin-table-th mb-1 block lg:hidden">Customer</span>
                  <p className="flex items-center gap-2 text-[0.82rem] text-[var(--admin-fg)]">
                    <UserIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {item.name}
                  </p>
                  <p className="flex items-center gap-2 text-[0.78rem] text-[var(--admin-fg-soft)]">
                    <PhoneIcon size={12} className="shrink-0 text-[var(--accent)]" />
                    {item.phone}
                  </p>
                  {item.email ? (
                    <p className="truncate text-[0.74rem] text-[var(--admin-fg-muted)]">
                      {item.email}
                    </p>
                  ) : (
                    <p className="text-[0.7rem] italic text-[var(--admin-fg-muted)]">
                      No email
                    </p>
                  )}
                </div>

                {/* Received */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Received</span>
                  <p className="flex items-center gap-2 text-[0.82rem] text-[var(--admin-fg)]">
                    <MailIcon size={13} className="shrink-0 text-[var(--accent)]" />
                    {formatWhen(item.createdAt)}
                  </p>
                  {item.branch && (
                    <p className="mt-1 text-[0.7rem] text-[var(--admin-fg-muted)]">{item.branch}</p>
                  )}
                  {item.repliedAt && (
                    <p className="mt-1 text-[0.68rem] text-[var(--admin-fg-muted)]">
                      Replied {formatWhen(item.repliedAt)}
                    </p>
                  )}
                  {item.closedAt && (
                    <p className="mt-1 text-[0.68rem] text-[var(--admin-fg-muted)]">
                      Closed {formatWhen(item.closedAt)}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Actions */}
                <div>
                  <span className="admin-table-th mb-1 block lg:hidden">Actions</span>
                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    {actions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.next}
                          type="button"
                          onClick={() => onStatusChange(item, action.next)}
                          aria-label={`Mark ${item.number} as ${action.label}`}
                          title={action.label}
                          className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-medium transition-colors ${action.tone}`}
                        >
                          <Icon size={12} />
                          {action.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      aria-label={`Open ${item.number}`}
                      title="Open message"
                      className="admin-icon-btn flex h-8 w-8 items-center justify-center"
                    >
                      <EyeIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditNotes(item)}
                      aria-label={`Edit notes for ${item.number}`}
                      title="Internal notes"
                      className="admin-icon-btn flex h-8 w-8 items-center justify-center"
                    >
                      <PencilIcon size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      aria-label={`Delete ${item.number}`}
                      title="Delete"
                      className="admin-icon-btn flex h-8 w-8 items-center justify-center text-[var(--brand-cta)] hover:border-[var(--brand-cta)]"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
