import { getSession } from "@/lib/auth/session";
import { getSeo, saveSeo } from "@/lib/seo/service";
import { validateSeo, type SeoInput } from "@/lib/seo/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Coerce a raw JSON body into a full SEO shape (missing fields become defaults). */
function toSeoInput(raw: Record<string, unknown>): SeoInput {
  return {
    siteTitle: asString(raw.siteTitle),
    metaTitle: asString(raw.metaTitle),
    metaDescription: asString(raw.metaDescription),
    keywords: asString(raw.keywords),
    canonicalUrl: asString(raw.canonicalUrl),
    ogTitle: asString(raw.ogTitle),
    ogDescription: asString(raw.ogDescription),
    ogImage: asString(raw.ogImage),
    twitterTitle: asString(raw.twitterTitle),
    twitterDescription: asString(raw.twitterDescription),
    twitterImage: asString(raw.twitterImage),
    googleAnalyticsId: asString(raw.googleAnalyticsId),
    googleTagManagerId: asString(raw.googleTagManagerId),
    googleSiteVerification: asString(raw.googleSiteVerification),
    facebookDomainVerification: asString(raw.facebookDomainVerification),
    robotsIndex: raw.robotsIndex === true,
    robotsFollow: raw.robotsFollow === true,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const seo = await getSeo();
    return Response.json({ ok: true, seo }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/seo failed:", error);
    return Response.json(
      { ok: false, error: "Could not load SEO settings." },
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
      { ok: false, error: "SEO payload must be a JSON object." },
      { status: 400, headers: NO_STORE }
    );
  }

  const data = toSeoInput(body as Record<string, unknown>);
  const errors = validateSeo(data);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const seo = await saveSeo(data);
    return Response.json({ ok: true, seo }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("PUT /api/seo failed:", error);
    return Response.json(
      { ok: false, error: "Could not save SEO settings." },
      { status: 500, headers: NO_STORE }
    );
  }
}
