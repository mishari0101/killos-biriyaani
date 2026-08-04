import { buildStructuredData, safeJsonLd } from "@/lib/seo/jsonld";
import { getSiteSeo } from "@/lib/seo/public";

/**
 * Restaurant, Organization, WebSite and Breadcrumb structured data.
 *
 * All four schemas are built from the same SiteSEO + RestaurantSettings
 * sources so they never drift from the site. Everything is optional — if the
 * database is unreachable the component renders nothing.
 */
export async function StructuredJsonLd() {
  let data;
  try {
    const { seo, settings, baseUrl, name } = await getSiteSeo();
    data = await buildStructuredData({ seo, settings, baseUrl, name });
  } catch {
    return null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(data.restaurant) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(data.organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(data.website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(data.breadcrumb) }}
      />
    </>
  );
}
