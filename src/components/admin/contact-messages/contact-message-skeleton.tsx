export function ContactMessageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="admin-card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="admin-skeleton h-10 w-10 rounded-xl" />
                <div className="admin-skeleton h-4 w-16 rounded-full" />
              </div>
              <div className="admin-skeleton mt-4 h-8 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="admin-skeleton h-11 w-full max-w-sm" />
          <div className="admin-skeleton h-11 w-full max-w-[8rem]" />
        </div>
        <div className="admin-divider" />
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="admin-skeleton h-3 w-20" />
              <div className="admin-skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="space-y-4 p-6 sm:p-7">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="admin-skeleton h-4 w-48" />
                <div className="admin-skeleton h-3 w-72 max-w-full" />
              </div>
              <div className="admin-skeleton h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
