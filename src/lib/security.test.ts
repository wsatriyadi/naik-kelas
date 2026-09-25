import { describe, expect, it } from "vitest";
import { createSessionToken, readSessionToken, safeRedirectPath, verifyPassword, hashPassword } from "@/lib/security";

describe("session token", () => {
  it("membaca token yang dibuat sendiri dan menolak manipulasi", () => {
    const token = createSessionToken(42);
    const payload = readSessionToken(token);
    expect(payload?.userId).toBe(42);
    expect(readSessionToken(`${token}x`)).toBeNull();
    expect(readSessionToken("nonsense")).toBeNull();
  });
});

describe("password hashing", () => {
  it("meng verifier hashing tanpa menyimpan password plaintext", () => {
    const stored = hashPassword("Rahasia-Kuat-123");
    expect(stored).not.toContain("Rahasia-Kuat-123");
    expect(verifyPassword("Rahasia-Kuat-123", stored)).toBe(true);
    expect(verifyPassword("salah", stored)).toBe(false);
  });
});

describe("safeRedirectPath", () => {
  it("hanya menerima path internal", () => {
    expect(safeRedirectPath("/peserta")).toBe("/peserta");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("https://evil.example")).toBe("/");
  });
});
