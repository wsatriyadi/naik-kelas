import { BarChart3, CheckCircle2, FileText, XCircle } from "lucide-react";
import { getDashboardStats, getCertificateList, listRegistrations } from "@/lib/repository";
import { formatDate } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const stats = getDashboardStats();
  const registrations = listRegistrations();
  const certificates = getCertificateList();
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Ringkasan operasional</div><h1 className="display">Laporan<br /><span style={{ color: "var(--blue)" }}>yang bisa dibaca.</span></h1><p>Angka untuk membantu tindak lanjut, bukan untuk menambah pekerjaan.</p></div><span className="badge blue"><BarChart3 size={13} style={{ verticalAlign: "-2px" }} /> Ringkasan</span></div>
      <div className="stat-grid"><div className="stat-card"><p>Total peserta</p><strong>{stats.totalParticipants}</strong><small>Tidak termasuk yang ditolak</small></div><div className="stat-card"><p>Lulus</p><strong>{stats.passedParticipants}</strong><small>Siap menerbitkan sertifikat</small></div><div className="stat-card"><p>Belum lulus</p><strong>{stats.failedParticipants}</strong><small>Perlu tindak lanjut</small></div><div className="stat-card"><p>Sertifikat</p><strong>{stats.issuedCertificates}</strong><small>Dapat diverifikasi publik</small></div></div>
      <div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>Status pendaftaran</h2><span className="form-hint">{registrations.length} data</span></div><div className="table-wrap"><table><thead><tr><th>Program</th><th>Peserta</th><th>Status</th><th>Terdaftar</th></tr></thead><tbody>{registrations.map((registration) => <tr key={registration.id}><td><strong>{registration.training_title}</strong></td><td>{registration.participant_name}</td><td>{registration.status === "COMPLETED" ? <span className="badge green"><CheckCircle2 size={11} /> Selesai</span> : registration.status === "REJECTED" ? <span className="badge red"><XCircle size={11} /> Ditolak</span> : <span className="badge orange">{registration.status}</span>}</td><td>{formatDate(registration.registered_at)}</td></tr>)}</tbody></table></div></section><section className="panel"><div className="panel-head"><h2>Sertifikat terbaru</h2><FileText size={16} style={{ color: "var(--blue)" }} /></div><div className="panel-body"><div className="timeline">{certificates.slice(0, 6).map((certificate) => <div className="timeline-item" key={certificate.id}><div className="timeline-date">{formatDate(certificate.issuedAt, { day: "2-digit", month: "short" })}</div><div><h3>{certificate.participantName}</h3><p>{certificate.trainingTitle} · {certificate.earnedJp} JP</p></div></div>)}</div></div></section></div>
    </>
  );
}
