export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div className="admin-skeleton h-10 w-10 rounded-xl" />
              <div className="admin-skeleton h-4 w-12 rounded-full" />
            </div>
            <div className="admin-skeleton mt-4 h-8 w-16" />
            <div className="admin-skeleton mt-2 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="admin-card p-5">
            <div className="admin-skeleton h-10 w-10 rounded-xl" />
            <div className="admin-skeleton mt-4 h-8 w-14" />
            <div className="admin-skeleton mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 sm:px-7">
          <div className="admin-skeleton h-5 w-40" />
          <div className="admin-skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="mt-5 grid grid-cols-1 divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-6">
              <div className="admin-skeleton h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <div className="admin-skeleton h-6 w-10" />
                <div className="admin-skeleton h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="admin-card flex items-center gap-4 p-4">
            <div className="admin-skeleton h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="admin-skeleton h-4 w-36" />
              <div className="admin-skeleton h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 sm:px-7">
          <div className="admin-skeleton h-5 w-36" />
          <div className="admin-skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 space-y-4 p-6 pt-0 sm:p-7 sm:pt-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="admin-skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="admin-skeleton h-4 w-40" />
                <div className="admin-skeleton h-3 w-56" />
              </div>
              <div className="admin-skeleton h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="admin-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="admin-skeleton h-5 w-32" />
                <div className="admin-skeleton h-3 w-20" />
              </div>
              <div className="admin-skeleton h-8 w-20 rounded-full" />
            </div>
            <div className="admin-skeleton mt-6 h-36 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
