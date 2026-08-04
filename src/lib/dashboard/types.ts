export type RecentActivityKind = "reservation" | "message";

export interface RecentActivityItem {
  id: number;
  kind: RecentActivityKind;
  name: string;
  number: string;
  status: string;
  createdAt: string;
}

export interface DashboardChartPoint {
  date: string;
  label: string;
  value: number;
}

export interface DashboardChart {
  points: DashboardChartPoint[];
  total: number;
  max: number;
}

export interface DashboardStats {
  reservationsTotal: number;
  reservationsPending: number;
  reservationsToday: number;
  messagesTotal: number;
  messagesNew: number;
  menuItems: number;
  galleryImages: number;
  attractions: number;
  reviews: number;
  branches: number;
}

export interface TodaySummary {
  reservationsToday: number;
  messagesToday: number;
  pendingReservations: number;
  unreadMessages: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent: RecentActivityItem[];
  reservationsChart: DashboardChart;
  messagesChart: DashboardChart;
  today: TodaySummary;
  now: number;
}
