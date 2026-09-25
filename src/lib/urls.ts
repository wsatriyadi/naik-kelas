export function getPublicBaseUrl(): string {
  const configured = process.env.APP_URL ?? "http://localhost:3000";
  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("APP_URL harus berupa URL absolut");
  }
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("APP_URL pada production wajib menggunakan HTTPS");
  }
  return parsed.origin;
}

export function publicPath(path: string): string {
  return new URL(path, `${getPublicBaseUrl()}/`).toString();
}
