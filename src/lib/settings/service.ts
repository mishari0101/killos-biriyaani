import "server-only";

import { getSingleton, setSingleton } from "@/lib/firebase/repo";
import { DEFAULT_SETTINGS } from "./defaults";
import { DAYS, type DayHours, type SettingsData, type SettingsRow, type SocialKey, type SocialMedia } from "./types";

function toSocialMedia(value: unknown): SocialMedia {
  const base = { ...DEFAULT_SETTINGS.socialMedia };
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    (Object.keys(base) as SocialKey[]).forEach((key) => {
      const entry = record[key];
      if (entry && typeof entry === "object") {
        const e = entry as { url?: unknown; enabled?: unknown };
        base[key] = {
          url: typeof e.url === "string" ? e.url : "",
          enabled: e.enabled === true,
        };
      }
    });
  }
  return base;
}

function toBusinessHours(value: unknown): DayHours[] {
  if (Array.isArray(value)) {
    return DAYS.map((day) => {
      const entry = value.find((v) => v && typeof v === "object" && (v as { day?: unknown }).day === day);
      if (entry && typeof entry === "object") {
        const e = entry as { open?: unknown; close?: unknown; closed?: unknown };
        return {
          day,
          open: typeof e.open === "string" ? e.open : "10:00",
          close: typeof e.close === "string" ? e.close : "23:00",
          closed: e.closed === true,
        };
      }
      return { day, open: "10:00", close: "23:00", closed: false };
    });
  }
  return DEFAULT_SETTINGS.businessHours;
}

/** Map a stored row to the API shape (normalizes JSON columns + defaults). */
export function rowToSettings(row: SettingsRow): SettingsData {
  return {
    restaurantName: row.restaurantName,
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,

    primaryPhone: row.primaryPhone,
    secondaryPhone: row.secondaryPhone,
    whatsappNumber: row.whatsappNumber,
    email: row.email,

    businessHours: toBusinessHours(row.businessHours),
    socialMedia: toSocialMedia(row.socialMedia),

    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    keywords: row.keywords,
    ogImageUrl: row.ogImageUrl,

    darkModeDefault: row.darkModeDefault,
    accentColor: row.accentColor,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,

    mapsEmbedUrl: row.mapsEmbedUrl,
    latitude: row.latitude,
    longitude: row.longitude,

    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Map validated settings into a Firestore payload (no meta fields). */
function toStoreInput(data: SettingsData): Record<string, unknown> {
  return {
    restaurantName: data.restaurantName,
    tagline: data.tagline,
    shortDescription: data.shortDescription,
    longDescription: data.longDescription,
    logoUrl: data.logoUrl,
    faviconUrl: data.faviconUrl,
    primaryPhone: data.primaryPhone,
    secondaryPhone: data.secondaryPhone,
    whatsappNumber: data.whatsappNumber,
    email: data.email,
    businessHours: data.businessHours,
    socialMedia: data.socialMedia,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    keywords: data.keywords,
    ogImageUrl: data.ogImageUrl,
    darkModeDefault: data.darkModeDefault,
    accentColor: data.accentColor,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
    mapsEmbedUrl: data.mapsEmbedUrl,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

/** Fetch the single settings singleton. If none exists yet, seeds it with defaults and returns those. */
export async function getSettings(): Promise<SettingsData> {
  const row = await getSingleton<SettingsRow>("settings");
  if (row) return rowToSettings(row);
  await setSingleton("settings", toStoreInput(DEFAULT_SETTINGS));
  const seeded = await getSingleton<SettingsRow>("settings");
  return rowToSettings(seeded ?? (toStoreInput(DEFAULT_SETTINGS) as unknown as SettingsRow));
}

/** Upsert the settings singleton with validated settings. */
export async function saveSettings(data: SettingsData): Promise<SettingsData> {
  await setSingleton("settings", toStoreInput(data));
  const row = await getSingleton<SettingsRow>("settings");
  return rowToSettings(row ?? (toStoreInput(data) as unknown as SettingsRow));
}
