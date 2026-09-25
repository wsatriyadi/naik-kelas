import fs from "node:fs";
import path from "node:path";

function resolveConfiguredPath(value: string | undefined, fallbackParts: string[]): string {
  if (!value) return path.join(process.cwd(), ...fallbackParts);
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

export function getDatabasePath(): string {
  return resolveConfiguredPath(process.env.DATABASE_PATH, ["data", "diklat.sqlite"]);
}

export function getStoragePath(): string {
  return resolveConfiguredPath(process.env.STORAGE_PATH, ["storage"]);
}

export function ensureRuntimeDirectories(): void {
  fs.mkdirSync(path.dirname(getDatabasePath()), { recursive: true });
  fs.mkdirSync(getStoragePath(), { recursive: true });
}
