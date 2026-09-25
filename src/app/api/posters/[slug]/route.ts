import { NextResponse } from "next/server";
import { getTrainingBySlug } from "@/lib/repository";
import { formatDateRange } from "@/lib/domain";

export const runtime = "nodejs";

const posterColors: Record<string, { background: string; accent: string; ink: string }> = {
  indigo: { background: "#4c5cff", accent: "#d8f36a", ink: "#fffefa" },
  teal: { background: "#1e6b68", accent: "#ff765f", ink: "#fffefa" },
  orange: { background: "#ff765f", accent: "#fffefa", ink: "#14151b" },
  plum: { background: "#6d476f", accent: "#d8f36a", ink: "#fffefa" },
};

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const escapedSlug = escapeXml(slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
  const training = getTrainingBySlug(slug, { publicOnly: true });
  const title = escapeXml(training?.title ?? escapedSlug);
  const subtitle = escapeXml(training?.subtitle ?? "Ruang belajar yang terukur");
  const jp = training?.sessions.reduce((sum, session) => sum + session.jp, 0) ?? 0;
  const toneName = new URL(request.url).searchParams.get("tone") ?? "indigo";
  const tone = posterColors[toneName] ?? posterColors.indigo;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${tone.background}"/><circle cx="1050" cy="170" r="280" fill="none" stroke="${tone.ink}" stroke-opacity=".32" stroke-width="2"/><circle cx="1050" cy="170" r="205" fill="none" stroke="${tone.ink}" stroke-opacity=".22" stroke-width="2"/><path d="M0 520L1200 100" stroke="${tone.ink}" stroke-opacity=".16" stroke-width="2"/><rect x="48" y="44" width="1104" height="542" fill="none" stroke="${tone.ink}" stroke-opacity=".75"/><text x="84" y="106" fill="${tone.ink}" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="4">NAIK KELAS / 2026</text><text x="84" y="210" fill="${tone.accent}" font-family="Georgia, serif" font-size="70" font-weight="700">${title}</text><text x="84" y="275" fill="${tone.ink}" font-family="Arial, sans-serif" font-size="25">${subtitle}</text><g font-family="Arial, sans-serif" font-size="16" font-weight="700"><rect x="84" y="350" width="${Math.max(100, jp * 4)}" height="48" fill="${tone.accent}" stroke="${tone.ink}"/><text x="104" y="381" fill="#14151b">${jp} JP</text><rect x="230" y="350" width="170" height="48" fill="none" stroke="${tone.ink}"/><text x="253" y="381" fill="${tone.ink}">ONLINE</text><rect x="420" y="350" width="135" height="48" fill="none" stroke="${tone.ink}"/><text x="446" y="381" fill="${tone.ink}">${training?.price ? "BERBAYAR" : "GRATIS"}</text></g><text x="84" y="500" fill="${tone.ink}" font-family="Arial, sans-serif" font-size="17">${training ? formatDateRange(training.startsAt, training.endsAt) : "Segera hadir"}</text><text x="1116" y="550" text-anchor="end" fill="${tone.ink}" font-family="Arial, sans-serif" font-size="14" letter-spacing="3">DAFTAR SEKARANG ↗</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'", "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600" } });
}
