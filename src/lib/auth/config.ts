export const SESSION_COOKIE = "killo_admin_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_JWT_SECRET is not set. Add it to your environment (.env.local)."
    );
  }
  return secret;
}
