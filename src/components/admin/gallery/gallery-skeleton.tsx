export function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="admin-skeleton h-11 w-full max-w-sm" />
        <div className="admin-skeleton h-11 w-full max-w-[10rem]" />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden">
              <div className="admin-skeleton aspect-[4/3] w-full rounded-t-xl" />
              <div className="space-y-2 p-4">
                <div className="admin-skeleton h-4 w-2/3" />
                <div className="admin-skeleton h-3 w-full" />
                <div className="admin-skeleton h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
