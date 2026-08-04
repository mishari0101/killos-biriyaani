import type { ComponentType, ReactNode } from "react";

interface SectionCardProps {
  index: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  children: ReactNode;
}

export function SectionCard({ index, title, description, icon: Icon, children }: SectionCardProps) {
  return (
    <section className="admin-card overflow-hidden">
      <div className="flex items-start gap-4 border-b border-[var(--admin-border)] px-6 py-5 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field-bg)] text-[var(--accent)]">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="admin-section-index text-[0.78rem] font-semibold">{index}</span>
            <h2 className="truncate font-serif text-[1.05rem] font-semibold text-[var(--admin-fg)]">
              {title}
            </h2>
          </div>
          <p className="mt-0.5 text-[0.78rem] leading-relaxed text-[var(--admin-fg-soft)]">
            {description}
          </p>
        </div>
      </div>
      <div className="px-6 py-6 sm:px-7">{children}</div>
    </section>
  );
}
