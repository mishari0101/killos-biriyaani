export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const EXPECTED_LAST_120 =
  "nEWyMrzSi42z+WBTgBS2/JX8ARQS94lwteoBkOL2D+U+ovjuQdTlv0KjCC9Vz8ymc\\nAAaxp8ZKU3yuxV5P4XrT7I0=\\n-----END PRIVATE KEY-----\\n";

function safeStack(error: unknown): string {
  if (!(error instanceof Error)) return "";
  return String(error.stack ?? "").split("\n").slice(0, 5).join("\n");
}

function buildReport() {
  const raw =
    typeof process.env.FIREBASE_PRIVATE_KEY === "string"
      ? process.env.FIREBASE_PRIVATE_KEY
      : "";

  const stripped = raw.replace(/^['"]+/, "").replace(/['"]+$/, "").trim();
  const literalEnd = "-----END PRIVATE KEY-----\\n";

  return {
    ok: true,
    report: {
      rawLength: raw.length,
      trimmedCount: raw.length - stripped.length,
      strippedLeadingQuote: /^['"]+/.test(raw),
      strippedTrailingQuote: /['"]+$/.test(raw),
      last120Chars: raw.slice(-120),
      endsWithExactLiteral: raw.endsWith(literalEnd),
      endsWithExactLiteralAfterTrim: stripped.endsWith(literalEnd),
      endsWithEndMarkerPlain: stripped
        .replace(/(?:\\n|\s)+$/, "")
        .endsWith("-----END PRIVATE KEY-----"),
      expectedLast120: EXPECTED_LAST_120,
      matchesExpectedEnding: raw.slice(-120) === EXPECTED_LAST_120,
    },
  };
}

export async function GET() {
  try {
    return Response.json(buildReport(), { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("[api/debug/firebase-key]", error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = safeStack(error);
    const raw =
      typeof process.env.FIREBASE_PRIVATE_KEY === "string"
        ? process.env.FIREBASE_PRIVATE_KEY
        : "";

    try {
      return Response.json(
        {
          ok: true,
          report: {
            error: { message, stack },
            rawLength: raw.length,
            last120Chars: raw.slice(-120),
            expectedLast120: EXPECTED_LAST_120,
            endsWithExactLiteral: raw.endsWith(
              "-----END PRIVATE KEY-----\\n"
            ),
            matchesExpectedEnding: raw.slice(-120) === EXPECTED_LAST_120,
          },
        },
        { status: 200, headers: NO_STORE }
      );
    } catch {
      return new Response(
        JSON.stringify({
          ok: true,
          report: { error: { message } },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...NO_STORE },
        }
      );
    }
  }
}
