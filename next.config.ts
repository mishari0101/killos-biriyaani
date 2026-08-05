import type { NextConfig } from "next";

const REQUIRED_ENV_VARS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_JWT_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]?.trim());
  if (missing.length === 0) return;
  throw new Error(
    `[env] Refusing to start: missing required environment variable` +
      `${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.\n` +
      "Set them before running the server (see .env.example)."
  );
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default function config(): NextConfig {
  assertRequiredEnv();
  return nextConfig;
}
