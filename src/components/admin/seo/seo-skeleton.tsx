export function SeoSkeleton() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="admin-skeleton mt-3 h-8 w-56" />
        <div className="admin-skeleton mt-3 h-4 w-96 max-w-full" />
      </header>

      {[0, 1, 2, 3].map((i) => (
        <section key={i} className="admin-card overflow-hidden">
          <div className="flex items-center gap-4 border-b border-[var(--admin-border)] px-6 py-5">
            <div className="admin-skeleton h-10 w-10" />
            <div className="flex-1 space-y-2">
              <div className="admin-skeleton h-5 w-48" />
              <div className="admin-skeleton h-3.5 w-72 max-w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <div className="admin-skeleton h-3.5 w-24" />
                <div className="admin-skeleton h-11 w-full" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
