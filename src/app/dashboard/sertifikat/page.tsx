import Link from "next/link";
import { Award, ExternalLink, FileBadge } from "lucide-react";
import { getCertificateList } from "@/lib/repository";
import { formatDate } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default function CertificatesPage() {
  const certificates = getCertificateList();
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Penerbitan & bukti</div><h1 className="display">Sertifikat<br /><span style={{ color: "var(--blue)" }}>yang bermakna.</span></h1><p>Nomor unik, QR code, dan JP yang dapat diperiksa penerima.</p></div><span className="badge green"><Award size={13} style={{ verticalAlign: "-2px" }} /> {certificates.length} terbit</span></div>
      {certificates.length ? <div className="table-wrap panel"><table><thead><tr><th>Nomor</th><th>Peserta</th><th>Program</th><th>JP</th><th>Nilai</th><th>Terbit</th><th /></tr></thead><tbody>{certificates.map((certificate) => <tr key={certificate.id}><td><strong>{certificate.certificateNumber}</strong><br /><span className="muted">{certificate.verificationCode}</span></td><td>{certificate.participantName}</td><td><Link href={`/dashboard/diklat/${certificate.trainingId}`}>{certificate.trainingTitle}</Link></td><td><strong>{certificate.earnedJp} JP</strong></td><td>{certificate.finalScore ?? "—"}</td><td>{formatDate(certificate.issuedAt)}</td><td><Link className="button small ghost" href={`/sertifikat/${certificate.verificationCode}`} target="_blank"><ExternalLink size={12} /> Buka</Link></td></tr>)}</tbody></table></div> : <div className="empty-state panel"><FileBadge size={28} style={{ color: "var(--blue)" }} /><h2 className="display">Belum ada sertifikat.</h2><p>Sertifikat diterbitkan setelah peserta dinyatakan lulus dan JPobtained tercatat.</p></div>}
    </>
  );
}
