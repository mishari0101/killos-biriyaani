import "server-only";

import { site as siteContent } from "@/lib/content/site";
import { listBranches } from "@/lib/branches/service";
import { DAYS, type DayHours, type SocialMedia } from "@/lib/settings/types";
import { toAbsoluteUrl, type SeoData } from "./types";
import { getSettingsSafe, DEFAULT_DESCRIPTION } from "./public";

/** Escape a schema for safe injection into a JSON-LD script tag. */
export function safeJsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

const CUISINES = ["Arabian", "South Asian", "Biriyani", "Kottu", "Barbecue"];

function enabledSocials(socialMedia: SocialMedia | null): string[] {
  if (!socialMedia) return [];
  return Object.values(socialMedia)
    .filter((s) => s.enabled && s.url.trim())
    .map((s) => s.url.trim());
}

function dayName(day: DayHours["day"]): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

interface StructuredInput {
  seo: SeoData;
  settings: Awaited<ReturnType<typeof getSettingsSafe>>;
  baseUrl: string;
  name: string;
}

/** One fetch, four schemas — Restaurant, Organization, WebSite and Breadcrumb. */
export async function buildStructuredData(input: StructuredInput) {
  const { seo, settings, baseUrl, name } = input;

  let featuredBranch: Awaited<ReturnType<typeof listBranches>>["items"][number] | null = null;
  try {
    const result = await listBranches({ pageSize: 50 });
    featuredBranch = result.items.find((b) => b.visible && b.featured) ?? result.items.find((b) => b.visible) ?? null;
  } catch {
    featuredBranch = null;
  }

  const logoUrl =
    toAbsoluteUrl(settings?.logoUrl || "/images/logo/killoslogo.webp", baseUrl);
  const imageUrl =
    toAbsoluteUrl(seo.ogImage, baseUrl) || logoUrl;

  const phone = settings?.primaryPhone.trim() || featuredBranch?.primaryPhone.trim() || siteContent.phone;
  const email = settings?.email.trim() || featuredBranch?.email.trim() || siteContent.email;
  const streetAddress =
    featuredBranch?.address.trim() || siteContent.address;
  const mapsUrl =
    featuredBranch?.mapsUrl.trim() || settings?.mapsEmbedUrl.trim() || "";

  const hours: DayHours[] = settings?.businessHours?.length
    ? settings.businessHours
    : DAYS.map((day) => ({ day, open: "10:00", close: "23:00", closed: false }));

  const openingHoursSpecification = hours
    .filter((h) => !h.closed)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [dayName(h.day)],
      opens: h.open,
      closes: h.close,
    }));

  const restaurant = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    image: imageUrl,
    url: baseUrl,
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    priceRange: "$$",
    servesCuisine: CUISINES,
    ...(streetAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress,
            addressCountry: "LK",
          },
        }
      : {}),
    ...(mapsUrl ? { hasMap: mapsUrl } : {}),
    ...(openingHoursSpecification.length
      ? { openingHoursSpecification }
      : {}),
    ...(featuredBranch
      ? { geo: { "@type": "GeoCoordinates", latitude: featuredBranch.latitude, longitude: featuredBranch.longitude } }
      : {}),
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: baseUrl,
    logo: logoUrl,
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(enabledSocials(settings?.socialMedia ?? null).length
      ? { sameAs: enabledSocials(settings?.socialMedia ?? null) }
      : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: baseUrl,
    description:
      seo.metaDescription.trim() || DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name,
      logo: { "@type": "ImageObject", url: logoUrl },
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
    ],
  };

  return { restaurant, organization, website, breadcrumb, featuredBranch };
}
