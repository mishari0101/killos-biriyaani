import { PenLineIcon } from "@/components/ui/icons";
import { BlogManager } from "@/components/admin/blog/blog-manager";
import { BlogSkeleton } from "@/components/admin/blog/blog-skeleton";
import { listBlogs } from "@/lib/blog/service";
import { Suspense } from "react";

export const metadata = {
  title: "Blog — Admin Studio",
};

export const dynamic = "force-dynamic";

async function BlogContent() {
  const initial = await listBlogs({});
  return <BlogManager initial={initial} />;
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Blog
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <PenLineIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Write stories, news and offers for your guests — draft, schedule and publish articles
          with markdown formatting, cover images, categories and search-optimised titles.
        </p>
      </header>

      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent />
      </Suspense>
    </div>
  );
}
