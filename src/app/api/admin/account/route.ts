import { getSession } from "@/lib/auth/session";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  getAdminAccount,
  updateAdminProfile,
  changeAdminPassword,
  toSessionPayload,
} from "@/lib/auth/service";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const NAME_MAX = 120;
const EMAIL_MAX = 160;
const PASSWORD_MIN = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function validateProfile(nameRaw: string, emailRaw: string) {
  const name = nameRaw.trim();
  const email = emailRaw.trim().toLowerCase();
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Display name is required.";
  else if (name.length > NAME_MAX) {
    errors.name = `Display name must be ${NAME_MAX} characters or fewer.`;
  }
  if (!email) errors.email = "Admin email is required.";
  else if (email.length > EMAIL_MAX) {
    errors.email = `Email must be ${EMAIL_MAX} characters or fewer.`;
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors };
  }
  return { ok: true as const, name, email };
}

function validatePasswordChange(current: string, next: string, confirm: string) {
  const errors: Record<string, string> = {};
  if (!current) errors.currentPassword = "Current password is required.";
  if (!next) {
    errors.newPassword = "New password is required.";
  } else {
    if (next.length < PASSWORD_MIN) {
      errors.newPassword = `New password must be at least ${PASSWORD_MIN} characters.`;
    }
    if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      errors.newPassword = "New password must include at least one letter and one number.";
    }
    if (current && next === current) {
      errors.newPassword = "New password must be different from the current password.";
    }
  }
  if (!confirm) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (next && next !== confirm) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  try {
    const account = await getAdminAccount();
    return Response.json(
      {
        ok: true,
        account: {
          name: account.name,
          email: account.email,
          lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
        },
      },
      { status: 200, headers: NO_STORE }
    );
  } catch (error) {
    console.error("GET /api/admin/account failed:", error);
    return Response.json(
      { ok: false, error: "Could not load the admin account." },
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

  const b = (body ?? {}) as Record<string, unknown>;
  const profile = validateProfile(asString(b.name), asString(b.email));
  if (!profile.ok) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors: profile.errors },
      { status: 422, headers: NO_STORE }
    );
  }
  const { name, email } = profile;

  try {
    const user = await updateAdminProfile(name, email);
    await createSession(toSessionPayload(user));
    return Response.json(
      {
        ok: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
      { status: 200, headers: NO_STORE }
    );
  } catch (error) {
    console.error("PUT /api/admin/account failed:", error);
    return Response.json(
      { ok: false, error: "Could not save the admin profile." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function POST(request: Request) {
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

  const b = (body ?? {}) as Record<string, unknown>;
  const currentPassword = asString(b.currentPassword);
  const newPassword = asString(b.newPassword);
  const confirmPassword = asString(b.confirmPassword);

  const errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
  if (Object.keys(errors).length > 0) {
    return Response.json(
      { ok: false, error: "Some fields are invalid.", errors },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const changed = await changeAdminPassword(currentPassword, newPassword);
    if (!changed) {
      return Response.json(
        { ok: false, error: "Current password is incorrect.", errors: { currentPassword: "Current password is incorrect." } },
        { status: 422, headers: NO_STORE }
      );
    }
    await deleteSession();
    return Response.json({ ok: true, signedOut: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/admin/account failed:", error);
    return Response.json(
      { ok: false, error: "Could not change the password." },
      { status: 500, headers: NO_STORE }
    );
  }
}
