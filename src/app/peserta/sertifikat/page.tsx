import Link from "next/link";
import { Award, ArrowRight, FileBadge } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireRole } from "@/lib/access";
import { getCertificateList } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function ParticipantCertificatesPage() {
  const user = requireRole(await getCurrentUser(), ["PARTICIPANT"]);
  const certificates = getCertificateList().filter((certificate) => certificate.participantId === user.id);
  return <main className="participant-main"><div className="container"><div className="participant-welcome"><div><div className="eyebrow">Dokumen saya</div><h1 className="display">Bukti yang<br /><span style={{ color: "var(--blue)" }}>bisa dibawa.</span></h1><p>Unduh sertifikat kapan saja, atau bagikan tautan verifikasinya.</p></div><span className="badge green"><Award size={13} style={{ verticalAlign: "-2px" }} /> {certificates.length} sertifikat</span></div>{certificates.length ? <div className="panel"><div className="table-wrap"><table><thead><tr><th>Nomor</th><th>Program</th><th>JP</th><th>Terbit</th><th /></tr></thead><tbody>{certificates.map((certificate) => <tr key={certificate.id}><td><strong>{certificate.certificateNumber}</strong><br /><span className="muted">{certificate.verificationCode}</span></td><td>{certificate.trainingTitle}</td><td><strong>{certificate.earnedJp} JP</strong></td><td>{new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(certificate.issuedAt))}</td><td><Link className="button small" href={`/sertifikat/${certificate.verificationCode}`}>Buka <ArrowRight size={12} /></Link></td></tr>)}</tbody></table></div></div> : <div className="empty-state panel"><FileBadge size={28} style={{ color: "var(--blue)" }} /><h2 className="display">Belum ada sertifikat.</h2><p>Selesaikan pelatihan dan penilaian terlebih dahulu. Sertifikatmu akan muncul di sini.</p><Link className="button" href="/diklat">Cari diklat <ArrowRight size={14} /></Link></div>}</div></main>;
}
