import { verifyCredentials, recordAdminLogin, toSessionPayload, type AdminUser } from "@/lib/auth/service";
import { createSession, isSecureRequest } from "@/lib/auth/session";
import {
  clientIp,
  consumeRateLimit,
  peekRateLimit,
  resetRateLimit,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

/** Key by (client, attempted email) so failed attempts against a different
 *  email can never lock the admin out of their own account. */
function loginKey(request: Request, email: string): string {
  return `login:${clientIp(request)}:${email.trim().toLowerCase()}`;
}

export async function POST(request: Request) {
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
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";

  if (!email || !password) {
    return Response.json(
      { ok: false, error: "Email and password are required." },
      { status: 400, headers: NO_STORE }
    );
  }

  const key = loginKey(request, email);

  const check = peekRateLimit(key, LOGIN_MAX_ATTEMPTS);
  if (!check.allowed) {
    return Response.json(
      {
        ok: false,
        error: "Too many sign-in attempts. Please try again in a few minutes.",
      },
      {
        status: 429,
        headers: {
          ...NO_STORE,
          "Retry-After": String(
            Math.max(1, Math.ceil(check.retryAfterMs / 1000))
          ),
        },
      }
    );
  }

  let user: AdminUser | null = null;
  try {
    user = await verifyCredentials(email, password);
  } catch {
    return Response.json(
      { ok: false, error: "Authentication is not configured on this server." },
      { status: 500, headers: NO_STORE }
    );
  }

  if (!user) {
    consumeRateLimit(key, {
      limit: LOGIN_MAX_ATTEMPTS,
      windowMs: LOGIN_WINDOW_MS,
    });
    return Response.json(
      { ok: false, error: "Invalid credentials." },
      { status: 401, headers: NO_STORE }
    );
  }

  resetRateLimit(key);
  await recordAdminLogin();
  await createSession(toSessionPayload(user), { secure: isSecureRequest(request) });

  return Response.json(
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    { status: 200, headers: NO_STORE }
  );
}
