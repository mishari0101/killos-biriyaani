"use client";

import {
  ClockIcon,
  CloseIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { ContactMessageData } from "@/lib/contact-messages/types";

const STATUS_META: Record<ContactMessageData["status"], { label: string; pill: string }> = {
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ContactMessageDetailModalProps {
  item: ContactMessageData;
  onClose: () => void;
}

export function ContactMessageDetailModal({ item, onClose }: ContactMessageDetailModalProps) {
  const meta = STATUS_META[item.status];

  const rows = [
    { label: "Reference Number", value: item.number },
    { label: "Customer Name", value: item.name },
    { label: "Phone", value: item.phone, icon: PhoneIcon },
    ...(item.email ? [{ label: "Email", value: item.email, icon: MailIcon }] : []),
    { label: "Subject", value: item.subject },
    { label: "Created Time", value: formatWhen(item.createdAt), icon: ClockIcon },
    ...(item.branch ? [{ label: "Branch", value: item.branch, icon: MapPinIcon }] : []),
  ];

  return (
    <div
      className="admin-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Message ${item.number}`}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto">
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-6 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums tracking-[0.08em] text-[var(--accent)]">
                    {item.number}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.66rem] font-medium uppercase tracking-[0.1em] ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <h2 className="mt-3 truncate font-serif text-lg font-semibold text-[var(--admin-fg)]">
                  {item.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="admin-icon-btn flex h-8 w-8 shrink-0 items-center justify-center"
              >
                <CloseIcon size={15} />
              </button>
            </div>

            <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label}>
                    <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
                      {row.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 break-words text-[0.88rem] text-[var(--admin-fg)]">
                      {Icon && <Icon size={13} className="shrink-0 text-[var(--accent)]" />}
                      {row.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] p-5">
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
                Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[0.9rem] leading-[1.75] text-[var(--admin-fg)]">
                {item.message}
              </p>
            </div>

            {item.notes && (
              <div className="mt-4">
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[var(--admin-fg-muted)]">
                  Internal notes
                </p>
                <p className="mt-1 text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
                  <span className="mr-1">•</span>
                  {item.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--admin-border)] px-6 py-4 sm:px-7">
            <span className="mr-auto flex items-center gap-1.5 text-[0.72rem] text-[var(--admin-fg-muted)]">
              <UserIcon size={12} />
              From {item.name}
            </span>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
