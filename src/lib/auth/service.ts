import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

export const ADMIN_ROLE = "admin" as const;

/**
 * Env-based admin credentials. There is no fallback: missing environment
 * variables are a configuration error and must surface loudly.
 */
export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment. " +
        "Refusing to use default credentials."
    );
  }
  return { email, password };
}

function constantTimeEqual(a: string, b: string): boolean {
  const aDigest = createHash("sha256").update(a).digest();
  const bDigest = createHash("sha256").update(b).digest();
  return timingSafeEqual(aDigest, bDigest);
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const { email: expectedEmail, password: expectedPassword } =
    getAdminCredentials();
  if (
    !email ||
    !password ||
    !constantTimeEqual(email.toLowerCase(), expectedEmail.toLowerCase()) ||
    !constantTimeEqual(password, expectedPassword)
  ) {
    return null;
  }
  return {
    id: "admin-1",
    email: expectedEmail,
    name: "Owner",
    role: ADMIN_ROLE,
  };
}

export function toSessionPayload(user: AdminUser) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "admin" as const,
  };
}
