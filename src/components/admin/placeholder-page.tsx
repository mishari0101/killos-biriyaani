import Link from "next/link";
import { ArrowLeftIcon, GridIcon } from "@/components/ui/icons";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: (props: { size?: number }) => React.JSX.Element;
  planned?: boolean;
  bullets: string[];
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  planned = false,
  bullets,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          {description}
        </p>
      </header>

      <div className="admin-card mt-8 overflow-hidden">
        <div
          className="admin-placeholder-grid relative flex flex-col items-center justify-center px-6 py-20 text-center"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, var(--accent-soft), transparent 70%)",
          }}
        >
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-[var(--accent)] opacity-[0.07] blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--accent)] shadow-[var(--admin-shadow)]">
              <Icon size={26} />
            </div>
          </div>

          <h2 className="mt-6 font-serif text-xl font-semibold text-[var(--admin-fg)]">
            {title} is coming soon
          </h2>
          <p className="mt-2 max-w-md text-[0.85rem] leading-relaxed text-[var(--admin-fg-soft)]">
            {planned
              ? "This workspace is planned for a future phase. When it ships it will be built on the same foundation as the rest of the dashboard."
              : "The shell for this workspace is ready. CRUD operations, validation and database wiring arrive in the next phases."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {bullets.map((bullet) => (
              <span key={bullet} className="admin-chip">
                {bullet}
              </span>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <Link href="/admin" className="admin-btn admin-btn-ghost">
              <ArrowLeftIcon size={16} />
              Back to dashboard
            </Link>
            <Link href="/" className="admin-btn admin-btn-primary">
              <GridIcon size={16} />
              Open live site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
