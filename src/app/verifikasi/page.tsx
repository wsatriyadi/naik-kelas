import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getCertificateByCode } from "@/lib/repository";
import { formatDateRange } from "@/lib/domain";

export const dynamic = "force-dynamic";

export const metadata = { title: "Verifikasi Sertifikat" };

interface VerifyPageProps { searchParams: Promise<{ code?: string }> }

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const code = (await searchParams).code?.trim() ?? "";
  const certificate = code ? getCertificateByCode(code) : null;
  return (
    <div className="verify-page">
      <div className="verify-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 15, alignItems: "center" }}><Link href="/" className="brand"><span className="brand-mark">↗</span><span>naik kelas</span></Link><Link href="/" className="form-hint"><ArrowLeft size={12} style={{ verticalAlign: "-2px" }} /> Beranda</Link></div>
        <div className="eyebrow" style={{ marginTop: 35 }}><ShieldCheck size={13} style={{ verticalAlign: "-2px" }} /> Verifikasi publik</div>
        <h1 className="display">Bukti<br /><span style={{ color: "var(--blue)" }}>yang jujur.</span></h1>
        <p>Masukkan kode yang tertera pada sertifikat atau pindai QR code untuk melihat status keaslian.</p>
        <form className="verify-form"><input name="code" defaultValue={code} placeholder="Contoh: NK-93-4A1D-2026" aria-label="Kode sertifikat" required /><button className="button" type="submit">Periksa</button></form>
        {code ? certificate ? <div className="verify-result"><div className="eyebrow" style={{ color: "var(--ink)" }}>Sertifikat valid</div><h2>Terdaftar dalam sistem.</h2><div className="verify-meta"><div><span>Nomor</span><strong>{certificate.certificateNumber}</strong></div><div><span>Status</span><strong>VALID</strong></div><div><span>Peserta</span><strong>{certificate.participantName}</strong></div><div><span>Program</span><strong>{certificate.trainingTitle}</strong></div><div><span>JP diperoleh</span><strong>{certificate.earnedJp} JP</strong></div><div><span>Waktu</span><strong>{formatDateRange(certificate.startsAt, certificate.endsAt)}</strong></div></div><Link className="button small" style={{ marginTop: 18 }} href={`/sertifikat/${certificate.verificationCode}`}>Lihat sertifikat <ArrowLeft size={12} style={{ transform: "rotate(180deg)" }} /></Link></div> : <div className="verify-result invalid"><div className="eyebrow" style={{ color: "var(--ink)" }}>Kode tidak ditemukan</div><h2>Belum bisa dipastikan.</h2><p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 13 }}>Periksa kembali kode sertifikat atau hubungi penyelenggara.</p></div> : null}
      </div>
    </div>
  );
}
