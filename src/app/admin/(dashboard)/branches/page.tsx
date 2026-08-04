import { StoreIcon } from "@/components/ui/icons";
import { BranchManager } from "@/components/admin/branches/branch-manager";
import { BranchSkeleton } from "@/components/admin/branches/branch-skeleton";
import { listBranches } from "@/lib/branches/service";
import { Suspense } from "react";

export const metadata = {
  title: "Branches — Admin Studio",
};

export const dynamic = "force-dynamic";

async function BranchesContent() {
  const initial = await listBranches({ page: 1, pageSize: 50 });
  return <BranchManager initial={initial} />;
}

export default function BranchesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Branches
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <StoreIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Manage every outlet&rsquo;s location, contact details and opening hours. The featured
          branch drives the phones, WhatsApp, email and hours shown in the contact and footer
          sections. Every change goes live instantly.
        </p>
      </header>

      <Suspense fallback={<BranchSkeleton />}>
        <BranchesContent />
      </Suspense>
    </div>
  );
}
