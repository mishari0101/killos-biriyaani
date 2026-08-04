import { StarIcon } from "@/components/ui/icons";
import { AttractionManager } from "@/components/admin/attractions/attraction-manager";
import { AttractionSkeleton } from "@/components/admin/attractions/attraction-skeleton";
import { listAttractions } from "@/lib/attractions/service";
import { Suspense } from "react";

export const metadata = {
  title: "Attractions — Admin Studio",
};

export const dynamic = "force-dynamic";

async function AttractionsContent() {
  const initial = await listAttractions({ page: 1, pageSize: 50 });
  return <AttractionManager initial={initial} />;
}

export default function AttractionsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Attractions
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <StarIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Manage the travel section guests see — upload photos, set Google ratings and travel
          times, pin a featured spot, and reorder with drag &amp; drop.
        </p>
      </header>

      <Suspense fallback={<AttractionSkeleton />}>
        <AttractionsContent />
      </Suspense>
    </div>
  );
}
