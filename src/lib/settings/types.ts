import type { RestaurantSettingsModel } from "@/generated/prisma/models/RestaurantSettings";

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
  // 1 — Restaurant Information
  restaurantName: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  logoUrl: string;
  faviconUrl: string;

  // 2 — Contact Information
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;

  // 3 — Business Hours
  businessHours: DayHours[];

  // 4 — Social Media
  socialMedia: SocialMedia;

  // 5 — SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;

  // 6 — Theme
  darkModeDefault: boolean;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;

  // 7 — Location
  mapsEmbedUrl: string;
  latitude: number;
  longitude: number;

  // meta
  updatedAt: string | null;
}

/** Raw row as stored by Prisma. */
export type SettingsRow = RestaurantSettingsModel;

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

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  website: "Website",
};
