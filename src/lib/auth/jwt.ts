import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret, SESSION_MAX_AGE_SECONDS } from "./config";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export async function encryptSession(payload: SessionPayload) {
  const secret = new TextEncoder().encode(getJwtSecret());
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.userId !== "string" || payload.role !== "admin") {
      return null;
    }
    return {
      userId: payload.userId,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
      role: "admin",
    };
  } catch {
    return null;
  }
}
