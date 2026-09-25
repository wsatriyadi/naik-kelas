import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { getCertificateByCode } from "@/lib/repository";

export const runtime = "nodejs";

interface PdfRouteProps { params: Promise<{ code: string }> }

export async function GET(request: Request, { params }: PdfRouteProps) {
  const certificate = getCertificateByCode((await params).code);
  if (!certificate) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
  if (request.method !== "GET") return NextResponse.json({ error: "Metode tidak didukung" }, { status: 405 });
  const document = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = document.internal.pageSize.getWidth();
  const height = document.internal.pageSize.getHeight();
  document.setLineWidth(0.7);
  document.rect(12, 12, width - 24, height - 24);
  document.setLineWidth(0.2);
  document.rect(17, 17, width - 34, height - 34);
  document.setTextColor(76, 92, 255);
  document.setFontSize(10);
  document.text("NAIK KELAS / BUKTI BELAJAR", 24, 28);
  document.setTextColor(20, 21, 27);
  document.setFontSize(10);
  document.text(certificate.certificateNumber, width - 24, 28, { align: "right" });
  document.setDrawColor(222, 222, 216);
  document.line(24, 35, width - 24, 35);
  document.setTextColor(76, 92, 255);
  document.setFontSize(9);
  document.text("SERTIFIKAT", width / 2, 59, { align: "center" });
  document.setTextColor(20, 21, 27);
  document.setFont("helvetica", "bold");
  document.setFontSize(46);
  document.text("BERHASIL NAIK", width / 2, 78, { align: "center" });
  document.setFont("helvetica", "normal");
  document.setFontSize(11);
  document.text("Diberikan kepada", width / 2, 98, { align: "center" });
  document.setFont("helvetica", "bold");
  document.setFontSize(26);
  document.text(certificate.participantName, width / 2, 112, { align: "center" });
  document.setFont("helvetica", "normal");
  document.setFontSize(11);
  const description = `atas keberhasilan mengikuti pelatihan ${certificate.trainingTitle}`;
  document.text(description, width / 2, 130, { align: "center" });
  document.text(`yang diselenggarakan pada ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(certificate.startsAt))} – ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(certificate.endsAt))}`, width / 2, 139, { align: "center" });
  document.setFillColor(216, 243, 106);
  document.setDrawColor(20, 21, 27);
  document.roundedRect(width / 2 - 25, 151, 50, 16, 2, 2, "FD");
  document.setFont("helvetica", "bold");
  document.setFontSize(20);
  document.text(`${certificate.earnedJp} JP`, width / 2, 162, { align: "center" });
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text(`Fasilitator: ${certificate.facilitator}`, width / 2, 181, { align: "center" });
  document.line(24, height - 42, width - 24, height - 42);
  document.setFontSize(9);
  document.text(`Nilai: ${certificate.finalScore ?? "—"}`, 24, height - 30);
  document.text(`Terbit: ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(certificate.issuedAt))}`, width / 2, height - 30, { align: "center" });
  document.text(`Kode verifikasi: ${certificate.verificationCode}`, width - 24, height - 30, { align: "right" });
  const pdf = Buffer.from(document.output("arraybuffer"));
  return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${certificate.certificateNumber}.pdf"`, "Cache-Control": "no-store" } });
}
