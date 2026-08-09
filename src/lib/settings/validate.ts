import { DAYS, type SettingsData, type SocialKey } from "./types";

export type SocialMediaErrorKey = `socialMedia_${SocialKey}`;

export type SettingsErrors = Partial<
  Record<keyof SettingsData | SocialMediaErrorKey, string>
>;

/** Platforms the admin manages (and therefore validates) in Settings → Social Media. */
export const MANAGED_SOCIAL_KEYS: SocialKey[] = [
  "facebook",
  "instagram",
  "tiktok",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  if (!value.trim()) return true;
  return PHONE_RE.test(value.trim());
}

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validate the full settings payload. Returns a map of field → error message. */
export function validateSettings(data: SettingsData): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!data.restaurantName.trim()) {
    errors.restaurantName = "Restaurant name is required.";
  } else if (data.restaurantName.trim().length > 120) {
    errors.restaurantName = "Must be 120 characters or fewer.";
  }

  if (data.primaryPhone.trim() && !isValidPhone(data.primaryPhone)) {
    errors.primaryPhone = "Enter a valid phone number.";
  }

  if (data.whatsappNumber.trim() && !isValidPhone(data.whatsappNumber)) {
    errors.whatsappNumber = "Enter a valid phone number.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  for (const day of DAYS) {
    const entry = data.businessHours.find((h) => h.day === day);
    if (!entry) continue;
    if (!entry.closed) {
      if (!isValidTime(entry.open)) {
        errors[`businessHours_${day}_open` as keyof SettingsData] = "Invalid open time.";
      }
      if (!isValidTime(entry.close)) {
        errors[`businessHours_${day}_close` as keyof SettingsData] = "Invalid close time.";
      }
    }
  }

  if (data.mapsEmbedUrl.trim() && !isValidUrl(data.mapsEmbedUrl)) {
    errors.mapsEmbedUrl = "Enter a valid URL.";
  }

  for (const key of MANAGED_SOCIAL_KEYS) {
    const social = data.socialMedia[key];
    if (!social || !social.enabled) continue;
    const url = social.url.trim();
    if (!url) {
      errors[`socialMedia_${key}` as SocialMediaErrorKey] =
        "Enter a URL for the enabled platform.";
    } else if (!isValidUrl(url)) {
      errors[`socialMedia_${key}` as SocialMediaErrorKey] = "Enter a valid URL.";
    }
  }

  return errors;
}
