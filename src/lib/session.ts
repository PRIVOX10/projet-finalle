import { SignJWT, jwtVerify } from "jose";

// Ce module ne touche pas à la base : il est aussi chargé par le proxy.

export const SESSION_COOKIE = "kandili_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET manquant ou trop court (32 caractères minimum).");
  }
  return new TextEncoder().encode(value);
}

export type SessionPayload = { adminId: string; version: number };

export async function signSession({ adminId, version }: SessionPayload) {
  return new SignJWT({ version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.version !== "number") return null;
    return { adminId: payload.sub, version: payload.version };
  } catch {
    return null;
  }
}
