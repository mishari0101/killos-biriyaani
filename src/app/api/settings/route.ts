import { getSession } from "@/lib/auth/session";
import { DEFAULT_SETTINGS } from "@/lib/settings/defaults";
import { getSettings, saveSettings } from "@/lib/settings/service";
import { DAYS, type DayHours, type SettingsData, type SocialKey, type SocialMedia } from "@/lib/settings/types";
import { validateSettings } from "@/lib/settings/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const SOCIAL_KEYS: SocialKey[] = ["facebook", "instagram", "tiktok", "youtube", "website"];

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function toBusinessHours(value: unknown): DayHours[] {
  const source = Array.isArray(value) ? value : [];
  return DAYS.map((day) => {
    const entry = source.find(
      (v) => v && typeof v === "object" && (v as { day?: unknown }).day === day
    );
    const raw = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    return {
      day,
      open: asString(raw.open) || "10:00",
      close: asString(raw.close) || "23:00",
      closed: asBoolean(raw.closed),
    };
  });
}

function toSocialMedia(value: unknown): SocialMedia {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const result = { ...DEFAULT_SETTINGS.socialMedia };
  SOCIAL_KEYS.forEach((key) => {
    const entry = source[key] && typeof source[key] === "object" ? (source[key] as Record<string, unknown>) : {};
    result[key] = {
      url: asString(entry.url),
      enabled: asBoolean(entry.enabled),
    };
  });
  return result;
}

/** Coerce a raw JSON body into a full SettingsData shape (missing fields become defaults). */
function toSettingsData(raw: Record<string, unknown>): SettingsData {
  return {
    restaurantName: asString(raw.restaurantName),
    primaryPhone: asString(raw.primaryPhone),
    whatsappNumber: asString(raw.whatsappNumber),
    email: asString(raw.email),
    businessHours: toBusinessHours(raw.businessHours),
    mapsEmbedUrl: asString(raw.mapsEmbedUrl),
    socialMedia: toSocialMedia(raw.socialMedia),
    logoUrl: asString(raw.logoUrl),
    faviconUrl: asString(raw.faviconUrl),
    ogImageUrl: asString(raw.ogImageUrl),
    accentColor: asString(raw.accentColor),
    updatedAt: null,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const settings = await getSettings();
    return Response.json({ ok: true, settings }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/settings failed:", error);
    return Response.json(
      { ok: false, error: "Could not load settings." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400, headers: NO_STORE }
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      { ok: false, error: "Settings payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toSettingsData(body as Record<string, unknown>);
  const errors = validateSettings(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const saved = await saveSettings(data);
    return Response.json({ ok: true, settings: saved }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("PUT /api/settings failed:", error);
    return Response.json(
      { ok: false, error: "Could not save settings." },
      { status: 500, headers: NO_STORE }
    );
  }
}
