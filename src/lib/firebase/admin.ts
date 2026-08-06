import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

let cachedApp: App | undefined;

/** Read the Firebase admin configuration from the environment. */
export function firebaseEnv(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL " +
        "and FIREBASE_PRIVATE_KEY (see .env.example)."
    );
  }
  return {
    projectId,
    clientEmail,
    privateKey: privateKey
      .replace(/\\\\n/g, "\\n")
      .replace(/\\n/g, "\n"),
  };
}

/** Memoized Firebase Admin app. Initialized lazily on first use. */
export function getFirebaseApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return cachedApp;
  }
  const env = firebaseEnv();
  cachedApp = initializeApp({
    projectId: env.projectId,
    credential: cert({
      projectId: env.projectId,
      clientEmail: env.clientEmail,
      privateKey: env.privateKey,
    }),
  });
  return cachedApp;
}
