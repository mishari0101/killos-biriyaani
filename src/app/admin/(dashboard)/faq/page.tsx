import { TagIcon } from "@/components/ui/icons";
import { FaqManager } from "@/components/admin/faqs/faq-manager";
import { FaqSkeleton } from "@/components/admin/faqs/faq-skeleton";
import { listFaqs } from "@/lib/faqs/service";
import { Suspense } from "react";

export const metadata = {
  title: "FAQs — Admin Studio",
};

export const dynamic = "force-dynamic";

async function FaqContent() {
  const initial = await listFaqs();
  return <FaqManager initial={initial} />;
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            FAQs
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <TagIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Manage the questions guests ask — add, edit, hide or pin FAQs, tag them by category, and
          reorder with drag &amp; drop. Every change goes live instantly and powers the FAQ rich
          results in Google.
        </p>
      </header>

      <Suspense fallback={<FaqSkeleton />}>
        <FaqContent />
      </Suspense>
    </div>
  );
}
