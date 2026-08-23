import { MenuManager } from "@/components/admin/menu/menu-manager";
import { MenuSkeleton } from "@/components/admin/menu/menu-skeleton";
import { listMenuItems } from "@/lib/menu/service";
import { Suspense } from "react";

export const metadata = {
  title: "Menu Items — Admin Studio",
};

export const dynamic = "force-dynamic";

async function MenuContent({ search }: { search?: string }) {
  const initial = await listMenuItems({ page: 1, pageSize: 10, search });
  return <MenuManager initial={initial} initialSearch={search} />;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent search={search} />
      </Suspense>
    </div>
  );
}
