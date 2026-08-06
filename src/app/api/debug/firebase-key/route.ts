import "server-only";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const EXPECTED_LAST_120 =
  "nEWyMrzSi42z+WBTgBS2/JX8ARQS94lwteoBkOL2D+U+ovjuQdTlv0KjCC9Vz8ymc\\nAAaxp8ZKU3yuxV5P4XrT7I0=\\n-----END PRIVATE KEY-----\\n";

export async function GET() {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";

  const stripped = raw
    .replace(/^['"]+/, "")
    .replace(/['"]+$/, "")
    .trim();

  const literalEnd = "-----END PRIVATE KEY-----\\n";

  return Response.json(
    {
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
    },
    { status: 200, headers: NO_STORE }
  );
}
