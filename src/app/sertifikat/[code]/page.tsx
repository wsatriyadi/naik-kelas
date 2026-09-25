import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Download, ShieldCheck } from "lucide-react";
import { getCertificateByCode } from "@/lib/repository";
import { formatDate, formatDateRange, gradeFromScore } from "@/lib/domain";
import { publicPath } from "@/lib/urls";

export const dynamic = "force-dynamic";

interface CertificatePageProps { params: Promise<{ code: string }> }

export default async function CertificatePage({ params }: CertificatePageProps) {
  const certificate = getCertificateByCode((await params).code);
  if (!certificate) notFound();
  const qrData = await QRCode.toDataURL(publicPath(`/verifikasi?code=${encodeURIComponent(certificate.verificationCode)}`), { width: 220, margin: 1, color: { dark: "#14151b", light: "#f6f4ee" } });
  return (
    <div style={{ padding: "46px 20px 80px" }}><div className="container-narrow"><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 15, marginBottom: 20 }}><Link href="/verifikasi" className="form-hint">← Kembali ke verifikasi</Link><a className="button small secondary" href={`/api/certificates/${certificate.verificationCode}/pdf`}><Download size={13} /> Unduh PDF</a></div><article className="certificate"><div className="certificate-top"><span>Naik kelas / bukti belajar</span><span>{certificate.certificateNumber}</span></div><div className="certificate-body"><div className="eyebrow"><ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> Sertifikat terbit</div><h1 className="display">Berhasil<br /><span style={{ color: "var(--blue)" }}>naik.</span></h1><div style={{ color: "var(--muted)", fontSize: 12, marginTop: 28 }}>Diberikan kepada</div><h2 className="display">{certificate.participantName}</h2><p>atas keberhasilan mengikuti pelatihan <strong>{certificate.trainingTitle}</strong> yang diselenggarakan pada {formatDateRange(certificate.startsAt, certificate.endsAt)}, dengan fasilitator {certificate.facilitator}.</p><div className="certificate-jp">{certificate.earnedJp} JP</div><p>Nilai akhir {certificate.finalScore ?? "—"} · Predikat {certificate.finalScore ? gradeFromScore(certificate.finalScore) : "—"}</p></div><div className="certificate-footer"><div><small>Penyelenggara</small><strong>Tim Diklat Naik Kelas</strong></div><div><small>Terbit</small><strong>{formatDate(certificate.issuedAt)}</strong></div><div className="qr-box"><img src={qrData} alt={`QR verifikasi ${certificate.certificateNumber}`} /></div></div></article><div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 18, color: "var(--muted)", fontSize: 11, flexWrap: "wrap" }}><span>Pindai QR atau buka <Link href={`/verifikasi?code=${certificate.verificationCode}`} style={{ color: "var(--blue)", fontWeight: 800 }}>tautan verifikasi</Link></span><span>Kode: {certificate.verificationCode}</span></div></div></div>
  );
}
