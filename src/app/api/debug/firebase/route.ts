import "server-only";
import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function present(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

  const report: Record<string, unknown> = {
    projectIdPresent: present(projectId),
    clientEmailPresent: present(clientEmail),
    privateKeyPresent: present(privateKey),
    privateKeyLength: privateKey.length,
    startsWithBeginMarker: privateKey.startsWith("-----BEGIN PRIVATE KEY-----"),
    endsWithEndMarker: privateKey
      .replace(/(?:\\n|\s)+$/, "")
      .endsWith("-----END PRIVATE KEY-----"),
    hasSurroundingSingleQuotes:
      privateKey.startsWith("'") || privateKey.endsWith("'"),
    hasSurroundingDoubleQuotes:
      privateKey.startsWith('"') || privateKey.endsWith('"'),
    containsLiteralBackslashN: privateKey.includes("\\n"),
    containsRealNewlines: privateKey.includes("\n"),
  };

  let testApp: ReturnType<typeof initializeApp> | undefined;
  try {
    const existing = getApps()[0];
    if (existing) {
      report.firebaseAdminInit = "ok (using already-initialized app)";
    } else {
      testApp = initializeApp({
        projectId,
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      report.firebaseAdminInit = "ok";
    }

    const db = getFirestore(existing ?? testApp!);
    try {
      const doc = await db.collection("settings").doc("singleton").get();
      report.firestoreRead = doc.exists
        ? "ok (settings/singleton found)"
        : "ok (read succeeded; settings/singleton missing)";
    } catch (error) {
      report.firestoreRead = "error: " + errorMessage(error);
    }
  } catch (error) {
    report.firebaseAdminInit = "error: " + errorMessage(error);
  }

  if (testApp) {
    await deleteApp(testApp).catch(() => undefined);
  }

  return Response.json({ ok: true, report }, { status: 200, headers: NO_STORE });
}
