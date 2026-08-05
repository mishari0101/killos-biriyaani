import "server-only";

import { findAll } from "@/lib/firebase/repo";
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

interface ReservationCountRow {
  id: number;
  number: string;
  name: string;
  status: string;
  createdAt: Date;
}

interface MessageCountRow {
  id: number;
  number: string;
  name: string;
  status: string;
  createdAt: Date;
}

/** Every dashboard metric fetched from in-memory reads of the small datasets. */
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const today = todayLocalISO();
  const chartStart = startOfChartWindow(now);

  const [reservations, messages, menuItems, galleryImages, attractions, reviews, branches] =
    await Promise.all([
      findAll<ReservationCountRow & { date: string }>("reservations"),
      findAll<MessageCountRow>("contactMessages"),
      findAll("menuItems"),
      findAll("galleryItems"),
      findAll("attractions"),
      findAll("reviews"),
      findAll("branches"),
    ]);

  const reservationsPending = reservations.filter((r) => r.status === "PENDING").length;
  const reservationsToday = reservations.filter((r) => r.date === today).length;
  const messagesNew = messages.filter((m) => m.status === "NEW").length;
  const messagesToday = messages.filter((m) => m.createdAt.getTime() >= startOfLocalDay(now).getTime()).length;
  const unreadMessages = messages.filter((m) => m.status === "NEW" || m.status === "READ").length;

  const stats: DashboardStats = {
    reservationsTotal: reservations.length,
    reservationsPending,
    reservationsToday,
    messagesTotal: messages.length,
    messagesNew,
    menuItems: menuItems.length,
    galleryImages: galleryImages.length,
    attractions: attractions.length,
    reviews: reviews.length,
    branches: branches.length,
  };

  const todaySummary: TodaySummary = {
    reservationsToday,
    messagesToday,
    pendingReservations: reservationsPending,
    unreadMessages,
  };

  const recentReservations = [...reservations]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id)
    .slice(0, RECENT_COUNT);
  const recentMessages = [...messages]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id)
    .slice(0, RECENT_COUNT);

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

  const chartStartISO = toLocalISO(chartStart);
  const reservationCounts = new Map<string, number>();
  for (const row of reservations) {
    if (row.date >= chartStartISO) {
      reservationCounts.set(row.date, (reservationCounts.get(row.date) ?? 0) + 1);
    }
  }

  const messageCounts = new Map<string, number>();
  for (const row of messages) {
    if (row.createdAt.getTime() >= chartStart.getTime()) {
      const key = toLocalISO(new Date(row.createdAt));
      messageCounts.set(key, (messageCounts.get(key) ?? 0) + 1);
    }
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
