import "server-only";

import { db } from "@/lib/db";
import { todayLocalISO } from "@/lib/reservations/validate";
import type {
  DashboardChart,
  DashboardData,
  DashboardStats,
  RecentActivityItem,
  TodaySummary,
} from "./types";

const CHART_DAYS = 7;
const RECENT_COUNT = 5;

function toLocalISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Start of the current local day (midnight). */
function startOfLocalDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Start of the 7-day chart window (midnight, local). */
function startOfChartWindow(now: Date): Date {
  return addDays(startOfLocalDay(now), -(CHART_DAYS - 1));
}

/** Local day labels for the chart window, oldest → newest. */
function chartDays(): { date: string; label: string }[] {
  const start = startOfChartWindow(new Date());
  const days: { date: string; label: string }[] = [];
  for (let i = 0; i < CHART_DAYS; i++) {
    const day = addDays(start, i);
    days.push({
      date: toLocalISO(day),
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return days;
}

function buildChart(
  days: { date: string; label: string }[],
  counts: Map<string, number>
): DashboardChart {
  const points = days.map((day) => ({
    date: day.date,
    label: day.label,
    value: counts.get(day.date) ?? 0,
  }));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const max = Math.max(1, ...points.map((point) => point.value));
  return { points, total, max };
}

/** One optimized read: every dashboard metric fetched in a single parallel batch. */
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const today = todayLocalISO();
  const dayStart = startOfLocalDay(now);
  const chartStart = startOfChartWindow(now);

  const [
    reservationsTotal,
    reservationsPending,
    reservationsToday,
    messagesTotal,
    messagesNew,
    messagesToday,
    unreadMessages,
    menuItems,
    galleryImages,
    attractions,
    reviews,
    branches,
    recentReservations,
    recentMessages,
    reservationDayCounts,
    messageCreatedAts,
  ] = await Promise.all([
    db.reservation.count(),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.reservation.count({ where: { date: today } }),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { createdAt: { gte: dayStart } } }),
    db.contactMessage.count({ where: { status: { in: ["NEW", "READ"] } } }),
    db.menuItem.count(),
    db.galleryItem.count(),
    db.attraction.count(),
    db.review.count(),
    db.branch.count(),
    db.reservation.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: RECENT_COUNT,
      select: { id: true, number: true, name: true, status: true, createdAt: true },
    }),
    db.contactMessage.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: RECENT_COUNT,
      select: { id: true, number: true, name: true, status: true, createdAt: true },
    }),
    db.reservation.groupBy({
      by: ["date"],
      where: { date: { gte: toLocalISO(chartStart) } },
      _count: { _all: true },
    }),
    db.contactMessage.findMany({
      where: { createdAt: { gte: chartStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  const stats: DashboardStats = {
    reservationsTotal,
    reservationsPending,
    reservationsToday,
    messagesTotal,
    messagesNew,
    menuItems,
    galleryImages,
    attractions,
    reviews,
    branches,
  };

  const todaySummary: TodaySummary = {
    reservationsToday,
    messagesToday,
    pendingReservations: reservationsPending,
    unreadMessages,
  };

  const recent: RecentActivityItem[] = [
    ...recentReservations.map((row) => ({
      id: row.id,
      kind: "reservation" as const,
      name: row.name,
      number: row.number,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    })),
    ...recentMessages.map((row) => ({
      id: row.id,
      kind: "message" as const,
      name: row.name,
      number: row.number,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
    .slice(0, 6);

  const reservationCounts = new Map(
    reservationDayCounts.map((row) => [row.date, row._count._all])
  );

  const messageCounts = new Map<string, number>();
  for (const row of messageCreatedAts) {
    const key = toLocalISO(new Date(row.createdAt));
    messageCounts.set(key, (messageCounts.get(key) ?? 0) + 1);
  }

  const days = chartDays();
  const reservationsChart = buildChart(days, reservationCounts);
  const messagesChart = buildChart(days, messageCounts);

  return {
    stats,
    recent,
    reservationsChart,
    messagesChart,
    today: todaySummary,
    now: Date.now(),
  };
}
