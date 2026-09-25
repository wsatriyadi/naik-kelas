import { cookies } from "next/headers";
import { getUserById } from "@/lib/repository";
import { readSessionToken, sessionCookie } from "@/lib/security";
import type { SessionUser } from "@/lib/domain";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const payload = readSessionToken(cookieStore.get(sessionCookie.name)?.value);
  if (!payload) return null;
  return getUserById(payload.userId);
}
