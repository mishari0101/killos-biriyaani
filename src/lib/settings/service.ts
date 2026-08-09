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
    primaryPhone: row.primaryPhone,
    whatsappNumber: row.whatsappNumber,
    email: row.email,
    businessHours: toBusinessHours(row.businessHours),
    mapsEmbedUrl: row.mapsEmbedUrl,
    socialMedia: toSocialMedia(row.socialMedia),
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    ogImageUrl: row.ogImageUrl,
    accentColor: row.accentColor,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Map validated settings into a Firestore payload (no meta fields). */
function toStoreInput(data: SettingsData): Record<string, unknown> {
  return {
    restaurantName: data.restaurantName,
    primaryPhone: data.primaryPhone,
    whatsappNumber: data.whatsappNumber,
    email: data.email,
    businessHours: data.businessHours,
    mapsEmbedUrl: data.mapsEmbedUrl,
    socialMedia: data.socialMedia,
    logoUrl: data.logoUrl,
    faviconUrl: data.faviconUrl,
    ogImageUrl: data.ogImageUrl,
    accentColor: data.accentColor,
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
