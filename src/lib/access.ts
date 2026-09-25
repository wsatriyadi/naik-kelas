import { forbidden, unauthorized } from "next/navigation";
import type { Role, SessionUser } from "@/lib/domain";

export function isStaff(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "FACILITATOR" || role === "VERIFIER" || role === "LEADER";
}

export function isAdmin(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function requireUser(user: SessionUser | null): SessionUser {
  if (!user) unauthorized();
  return user;
}

export function requireRole(user: SessionUser | null, roles: Role[]): SessionUser {
  const currentUser = requireUser(user);
  if (!roles.includes(currentUser.role)) forbidden();
  return currentUser;
}
