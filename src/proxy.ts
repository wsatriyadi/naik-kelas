import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, sessionCookie } from "@/lib/security";
import { getUserById } from "@/lib/repository";

const publicPrefixes = ["/api/posters/", "/api/certificates/"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = pathname === "/" || pathname === "/masuk" || pathname === "/verifikasi" || pathname.startsWith("/sertifikat/") || pathname.startsWith("/diklat") || pathname.startsWith("/alur") || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isPublic || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }
  const payload = readSessionToken(request.cookies.get(sessionCookie.name)?.value);
  const user = payload ? getUserById(payload.userId) : null;
  if (!user) {
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname.startsWith("/dashboard") && user.role === "PARTICIPANT") {
    return NextResponse.redirect(new URL("/peserta", request.url));
  }
  if (pathname.startsWith("/peserta") && user.role !== "PARTICIPANT") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
