import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "diklat_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionPayload {
  userId: number;
  expiresAt: number;
  signature: string;
}

function secret(): string {
  const value = process.env.AUTH_SECRET ?? "local-development-secret-change-before-deploy";
  if (process.env.NODE_ENV === "production" && value.length < 32) {
    throw new Error("AUTH_SECRET minimal 32 karakter pada production");
  }
  return value;
}

function sign(value: string): string {
  return createHash("sha256").update(`${secret()}:${value}`).digest("base64url");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSessionToken(userId: number): string {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const body = `${userId}.${expiresAt}`;
  const token = `${body}.${sign(body)}`;
  return token;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [userIdRaw, expiresAtRaw, signature] = token.split(".");
  if (!userIdRaw || !expiresAtRaw || !signature) return null;
  const body = `${userIdRaw}.${expiresAtRaw}`;
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(sign(body));
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  const userId = Number(userIdRaw);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(userId) || userId <= 0 || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return null;
  return { userId, expiresAt, signature };
}

export const sessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export function safeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001F\u007F]/.test(value)) return fallback;
  try {
    const parsed = new URL(value, "http://diklat.local");
    return parsed.origin === "http://diklat.local" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
