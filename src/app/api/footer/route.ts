import { seedFooter, type FooterContent, type FooterSocial } from "@/lib/content/footer";
import { waHref } from "@/lib/contact";
import { getSettings } from "@/lib/settings/service";
import { isValidUrl } from "@/lib/settings/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

const MANAGED_SOCIAL_KEYS = ["facebook", "instagram", "tiktok"] as const;

/** Social links come from the settings store (single source of truth). No hardcoded URLs. */
async function settingsSocials(): Promise<FooterSocial[]> {
  const settings = await getSettings();
  const socials: FooterSocial[] = [];

  for (const key of MANAGED_SOCIAL_KEYS) {
    const social = settings.socialMedia[key];
    const url = social?.url?.trim() ?? "";
    if (social?.enabled && url && isValidUrl(url)) {
      socials.push({ id: key, label: SOCIAL_LABELS[key], href: url, enabled: true });
    }
  }

  const whatsapp = settings.whatsappNumber?.trim();
  if (whatsapp) {
    socials.push({
      id: "whatsapp",
      label: SOCIAL_LABELS.whatsapp,
      href: waHref(whatsapp),
      enabled: true,
    });
  }

  return socials;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object"
    ? (v as Record<string, unknown>)
    : {};
}

function strList(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
  return out.length ? out : fallback;
}

function links(v: unknown): FooterContent["quickLinks"] | null {
  if (!Array.isArray(v)) return null;
  const out = v
    .map((item) => {
      const l = obj(item);
      const label = typeof l.label === "string" ? l.label.trim() : "";
      if (!label) return null;
      return {
        id:
          typeof l.id === "string" && l.id
            ? l.id
            : `link-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label,
        href: typeof l.href === "string" ? l.href : "#",
        enabled: l.enabled !== false,
      };
    })
    .filter((x): x is FooterContent["quickLinks"][number] => x !== null);
  return out.length ? out.filter((l) => l.enabled) : null;
}

export async function GET() {
  const url = process.env.FOOTER_API_URL;
  const socials = await settingsSocials();

  if (!url) {
    return Response.json({ ...seedFooter, socials }, { headers: NO_STORE });
  }

  try {
    const token = process.env.FOOTER_API_TOKEN;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Footer API responded ${res.status}`);

    const payload = (await res.json()) as unknown;
    const raw = obj(payload);
    const body = raw.footer && typeof raw.footer === "object"
      ? (raw.footer as Record<string, unknown>)
      : raw;

    const footer: FooterContent = {
      logo: {
        src: str(obj(body.logo).src, seedFooter.logo.src),
        alt: str(obj(body.logo).alt, seedFooter.logo.alt),
      },
      name: str(body.name, seedFooter.name),
      tagline: str(body.tagline, seedFooter.tagline),
      description: str(body.description, seedFooter.description),
      socials,
      quickLinks: links(body.quickLinks) ?? seedFooter.quickLinks,
      phones: strList(body.phones, seedFooter.phones),
      hoursNote: str(body.hoursNote, seedFooter.hoursNote),
      hours: str(body.hours, seedFooter.hours),
      locations: strList(body.locations, seedFooter.locations),
      newsletter: {
        status: str(obj(body.newsletter).status, seedFooter.newsletter.status),
        title: str(obj(body.newsletter).title, seedFooter.newsletter.title),
        description: str(
          obj(body.newsletter).description,
          seedFooter.newsletter.description
        ),
        placeholder: str(
          obj(body.newsletter).placeholder,
          seedFooter.newsletter.placeholder
        ),
        button: str(obj(body.newsletter).button, seedFooter.newsletter.button),
        success: str(obj(body.newsletter).success, seedFooter.newsletter.success),
        error: str(obj(body.newsletter).error, seedFooter.newsletter.error),
      },
      copyright: str(body.copyright, seedFooter.copyright),
      policyLinks: links(body.policyLinks) ?? seedFooter.policyLinks,
      credit: {
        label: str(obj(body.credit).label, seedFooter.credit.label),
        href: str(obj(body.credit).href, seedFooter.credit.href),
      },
    };

    return Response.json(footer, { headers: NO_STORE });
  } catch (error) {
    console.error("[api/footer]", error);
    return Response.json({ ...seedFooter, socials }, { headers: NO_STORE });
  }
}
