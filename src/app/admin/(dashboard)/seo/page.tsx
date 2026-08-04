import { GlobeIcon } from "@/components/ui/icons";
import { SeoManager } from "@/components/admin/seo/seo-manager";
import { SeoSkeleton } from "@/components/admin/seo/seo-skeleton";
import { getSeo } from "@/lib/seo/service";
import { Suspense } from "react";

export const metadata = {
  title: "SEO — Admin Studio",
};

export const dynamic = "force-dynamic";

async function SeoContent() {
  const seo = await getSeo();
  return <SeoManager initialSeo={seo} />;
}

export default function SeoPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            SEO
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <GlobeIcon size={13} />
            Central control panel
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Manage every search, social and crawler setting for the restaurant — meta tags, Open
          Graph, Twitter cards, verification, analytics and robots rules. Every change applies
          across the public site instantly.
        </p>
      </header>

      <Suspense fallback={<SeoSkeleton />}>
        <SeoContent />
      </Suspense>
    </div>
  );
}
