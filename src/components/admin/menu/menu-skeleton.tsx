export function MenuSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="admin-skeleton h-11 w-full max-w-sm" />
        <div className="admin-skeleton h-11 w-full max-w-[10rem]" />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-2 gap-3 border-b border-[var(--admin-border)] px-6 py-4 sm:grid-cols-[2.2fr_1fr_1fr_1.1fr_1fr_1fr]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="admin-skeleton h-3.5 w-16" />
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-2 items-center gap-3 border-b border-[var(--admin-border)] px-6 py-4 last:border-b-0 sm:grid-cols-[2.2fr_1fr_1fr_1.1fr_1fr_1fr]"
          >
            <div className="admin-skeleton h-5 w-40 max-w-full" />
            <div className="admin-skeleton h-4 w-16" />
            <div className="admin-skeleton h-4 w-14" />
            <div className="admin-skeleton h-4 w-20" />
            <div className="admin-skeleton h-5 w-14" />
            <div className="admin-skeleton h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
