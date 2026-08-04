import { UtensilsIcon } from "@/components/ui/icons";
import { MenuManager } from "@/components/admin/menu/menu-manager";
import { MenuSkeleton } from "@/components/admin/menu/menu-skeleton";
import { listMenuItems } from "@/lib/menu/service";
import { Suspense } from "react";

export const metadata = {
  title: "Menu — Admin Studio",
};

export const dynamic = "force-dynamic";

async function MenuContent() {
  const initial = await listMenuItems({ page: 1, pageSize: 10 });
  return <MenuManager initial={initial} />;
}

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Menu
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <UtensilsIcon size={13} />
            Live to the site
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Build and price every dish the public menu shows — categories, availability,
          featured items and display order.
        </p>
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </div>
  );
}
