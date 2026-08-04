import { CalendarDaysIcon } from "@/components/ui/icons";
import { ReservationManager } from "@/components/admin/reservations/reservation-manager";
import { ReservationSkeleton } from "@/components/admin/reservations/reservation-skeleton";
import { listReservations } from "@/lib/reservations/service";
import { Suspense } from "react";

export const metadata = {
  title: "Reservations — Admin Studio",
};

export const dynamic = "force-dynamic";

async function ReservationsContent() {
  const initial = await listReservations({ page: 1, pageSize: 100 });
  return <ReservationManager initial={initial} />;
}

export default function ReservationsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
          Admin Studio
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            Reservations
          </h1>
          <span className="admin-chip hidden sm:inline-flex">
            <CalendarDaysIcon size={13} />
            Live from the website
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[0.9rem] text-[var(--admin-fg-soft)]">
          Every booking made from the website lands here instantly. Confirm, complete or cancel
          reservations, add internal notes, and track today&rsquo;s demand at a glance.
        </p>
      </header>

      <Suspense fallback={<ReservationSkeleton />}>
        <ReservationsContent />
      </Suspense>
    </div>
  );
}
