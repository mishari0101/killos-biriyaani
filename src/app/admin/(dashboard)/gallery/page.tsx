import { SparklesIcon } from "@/components/ui/icons";
import { GalleryManager } from "@/components/admin/gallery/gallery-manager";
import { GallerySkeleton } from "@/components/admin/gallery/gallery-skeleton";
import { listGalleryItems } from "@/lib/gallery/service";
import { Suspense } from "react";

export const metadata = {
  title: "Gallery — Admin Studio",
};

export const dynamic = "force-dynamic";

async function GalleryContent() {
  const initial = await listGalleryItems({ page: 1, pageSize: 50 });
  return <GalleryManager initial={initial} />;
}

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 max-md:mb-4">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)] max-md:hidden">
          Admin Studio
        </p>
        <div className="flex items-center gap-3 md:mt-1">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Gallery
          </h1>
          <span className="admin-chip inline-flex">
            <SparklesIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)] max-md:mt-1 max-md:text-[0.82rem] md:hidden">
          Manage guest-facing photos.
        </p>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)] max-md:hidden">
          Curate the photos guests see — upload, reorder with drag &amp; drop, and toggle
          visibility and featured.
        </p>
      </header>

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryContent />
      </Suspense>
    </div>
  );
}
