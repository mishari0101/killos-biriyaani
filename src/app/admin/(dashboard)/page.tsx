import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRightLongIcon } from "@/components/ui/icons";
import { getDashboardData } from "@/lib/dashboard/service";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { DashboardRecent } from "@/components/admin/dashboard/dashboard-recent";
import { DashboardQuickActions } from "@/components/admin/dashboard/dashboard-quick-actions";
import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { DashboardToday } from "@/components/admin/dashboard/dashboard-today";
import { DashboardSkeleton } from "@/components/admin/dashboard/dashboard-skeleton";

export const metadata = {
  title: "Dashboard — Admin Studio",
};

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

async function DashboardContent() {
  const data = await getDashboardData();
  return (
    <>
      <DashboardStats stats={data.stats} />
      <DashboardRecent items={data.recent} now={data.now} />
      <DashboardQuickActions />
      <DashboardCharts
        reservations={data.reservationsChart}
        messages={data.messagesChart}
      />
      <DashboardToday today={data.today} />
    </>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--admin-fg-muted)]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-[var(--admin-fg)] sm:text-3xl">
            {greeting()}, {session.name}
          </h1>
          <p className="mt-1.5 text-[0.9rem] text-[var(--admin-fg-soft)]">
            Here&rsquo;s the live pulse of Killo&rsquo;s Biriyani — bookings,
            enquiries and content in real time.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="admin-btn admin-btn-ghost"
        >
          <span>Open site</span>
          <ArrowRightLongIcon size={17} />
        </Link>
      </header>

      <div className="mt-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
