/** Raw row as stored in Firestore (includes the single-owner admin account). */
export interface SettingsRow {
  restaurantName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryPhone: string;
  whatsappNumber: string;
  email: string;
  businessHours: unknown;
  socialMedia: unknown;
  ogImageUrl: string;
  accentColor: string;
  mapsEmbedUrl: string;
  adminName: string;
  adminEmail: string;
  adminPasswordHash: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  day: DayKey;
  open: string;
  close: string;
  closed: boolean;
}

export type SocialKey = "facebook" | "instagram" | "tiktok" | "youtube" | "website";

export interface SocialLink {
  url: string;
  enabled: boolean;
}

export type SocialMedia = Record<SocialKey, SocialLink>;

/** Wire shape returned by the API and used by the settings form. */
export interface SettingsData {
  // 1 — Restaurant
  restaurantName: string;

  // 2 — Contact
  primaryPhone: string;
  whatsappNumber: string;
  email: string;

  // 3 — Business Hours
  businessHours: DayHours[];

  // 4 — Location
  mapsEmbedUrl: string;

  // 5 — Social Media
  socialMedia: SocialMedia;

  // Brand/SEO overrides — not edited in Settings, but still read by the public
  // site with safe fallbacks (src/lib/seo/*, src/app/(site)/layout.tsx).
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  accentColor: string;

  // meta
  updatedAt: string | null;
}

export const DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
