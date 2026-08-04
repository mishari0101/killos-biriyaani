import { MessageSquareIcon } from "@/components/ui/icons";
import { ReviewManager } from "@/components/admin/reviews/review-manager";
import { ReviewSkeleton } from "@/components/admin/reviews/review-skeleton";
import { listReviews } from "@/lib/reviews/service";
import { Suspense } from "react";

export const metadata = {
  title: "Reviews — Admin Studio",
};

export const dynamic = "force-dynamic";

async function ReviewsContent() {
  const initial = await listReviews({ page: 1, pageSize: 50 });
  return <ReviewManager initial={initial} />;
}

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Reviews
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <MessageSquareIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Moderate guest feedback — add, hide or pin reviews, upload customer photos, set star
          ratings, and reorder with drag &amp; drop. Every change goes live instantly.
        </p>
      </header>

      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsContent />
      </Suspense>
    </div>
  );
}
