export function FaqSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="admin-skeleton h-11 w-full max-w-sm" />
        <div className="admin-skeleton h-11 w-full max-w-[10rem]" />
      </div>

      <div className="admin-card overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4 border-b border-[var(--admin-border)] p-5 sm:px-6">
            <div className="admin-skeleton h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="admin-skeleton h-4 w-2/3" />
              <div className="admin-skeleton h-3 w-full" />
              <div className="admin-skeleton h-3 w-5/6" />
              <div className="admin-skeleton h-7 w-40 pt-1" />
            </div>
            <div className="flex gap-1.5">
              <div className="admin-skeleton h-8 w-8 rounded-full" />
              <div className="admin-skeleton h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
