import { DAYS, type DayHours, type SettingsData, type SocialMedia } from "./types";

export const DEFAULT_SOCIAL_MEDIA: SocialMedia = {
  facebook: { url: "", enabled: false },
  instagram: { url: "", enabled: false },
  tiktok: { url: "", enabled: false },
  youtube: { url: "", enabled: false },
  website: { url: "", enabled: false },
};

function defaultHours(): DayHours[] {
  return DAYS.map((day) => ({ day, open: "10:00", close: "23:00", closed: false }));
}

/** Used when no settings row exists yet — seeds the singleton with sensible demo content. */
export const DEFAULT_SETTINGS: SettingsData = {
  restaurantName: "Killo's Biriyani",

  primaryPhone: "",
  whatsappNumber: "",
  email: "",

  businessHours: defaultHours(),

  mapsEmbedUrl: "",

  socialMedia: DEFAULT_SOCIAL_MEDIA,

  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  accentColor: "#c9a227",

  updatedAt: null,
};
