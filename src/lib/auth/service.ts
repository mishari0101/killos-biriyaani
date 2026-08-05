import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings/service";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

export const ADMIN_ROLE = "admin" as const;

const SINGLETON_ID = 1;

/** Thrown when the bootstrap credentials are missing from the environment. */
export class AdminNotConfiguredError extends Error {
  constructor() {
    super(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment. " +
        "Refusing to use default credentials."
    );
    this.name = "AdminNotConfiguredError";
  }
}

/**
 * Env-based bootstrap credentials. They seed the DB-backed admin account on the
 * first sign-in and remain required as a configuration gate: missing environment
 * variables are a configuration error and must surface loudly.
 */
export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new AdminNotConfiguredError();
  }
  return { email, password };
}

function constantTimeEqual(a: string, b: string): boolean {
  const aDigest = createHash("sha256").update(a).digest();
  const bDigest = createHash("sha256").update(b).digest();
  return timingSafeEqual(aDigest, bDigest);
}

/** scrypt-hash stored as `scrypt:<salt-hex>:<hash-hex>`. */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

interface AdminAccountRow {
  name: string;
  email: string;
  passwordHash: string;
  lastLoginAt: Date | null;
}

/**
 * Ensure the DB-backed admin account exists. On first run it is seeded from the
 * environment credentials so existing installations keep working untouched.
 */
async function ensureAdminSeeded(): Promise<void> {
  await getSettings();
  const row = await db.restaurantSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) return;
  if (row.adminEmail && row.adminPasswordHash) return;

  const { email, password } = getAdminCredentials();
  await db.restaurantSettings.update({
    where: { id: SINGLETON_ID },
    data: {
      adminName: row.adminName || "Owner",
      adminEmail: row.adminEmail || email,
      adminPasswordHash: row.adminPasswordHash || hashPassword(password),
    },
  });
}

async function loadAdminAccount(): Promise<AdminAccountRow> {
  await ensureAdminSeeded();
  const row = await db.restaurantSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) throw new Error("Admin account row missing.");
  return {
    name: row.adminName || "Owner",
    email: row.adminEmail,
    passwordHash: row.adminPasswordHash,
    lastLoginAt: row.lastLoginAt,
  };
}

export interface AdminAccount {
  name: string;
  email: string;
  lastLoginAt: Date | null;
}

/** Public view of the single admin account (no secrets). */
export async function getAdminAccount(): Promise<AdminAccount> {
  const account = await loadAdminAccount();
  return {
    name: account.name,
    email: account.email,
    lastLoginAt: account.lastLoginAt,
  };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  let account: AdminAccountRow;
  try {
    account = await loadAdminAccount();
  } catch (error) {
    if (error instanceof AdminNotConfiguredError) throw error;
    return null;
  }
  if (!email || !password) return null;
  if (!constantTimeEqual(email.toLowerCase(), account.email.toLowerCase())) return null;
  if (!verifyPassword(password, account.passwordHash)) return null;
  return {
    id: "admin-1",
    email: account.email,
    name: account.name || "Owner",
    role: ADMIN_ROLE,
  };
}

/** Record the current time as the admin's last successful sign-in. */
export async function recordAdminLogin(): Promise<void> {
  await db.restaurantSettings.update({
    where: { id: SINGLETON_ID },
    data: { lastLoginAt: new Date() },
  });
}

/** Update the admin display name and sign-in email. */
export async function updateAdminProfile(name: string, email: string): Promise<AdminUser> {
  await ensureAdminSeeded();
  const row = await db.restaurantSettings.update({
    where: { id: SINGLETON_ID },
    data: {
      adminName: name.trim(),
      adminEmail: email.trim().toLowerCase(),
    },
  });
  return {
    id: "admin-1",
    email: row.adminEmail,
    name: row.adminName,
    role: ADMIN_ROLE,
  };
}

/** Verify the current password, then replace it. Returns false if current is wrong. */
export async function changeAdminPassword(
  currentPassword: string,
  nextPassword: string
): Promise<boolean> {
  const account = await loadAdminAccount();
  if (!verifyPassword(currentPassword, account.passwordHash)) return false;
  await db.restaurantSettings.update({
    where: { id: SINGLETON_ID },
    data: { adminPasswordHash: hashPassword(nextPassword) },
  });
  return true;
}

export function toSessionPayload(user: AdminUser) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: "admin" as const,
  };
}
