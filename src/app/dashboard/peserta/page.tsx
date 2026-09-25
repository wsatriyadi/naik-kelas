import Link from "next/link";
import { Users } from "lucide-react";
import { listRegistrations } from "@/lib/repository";
import { formatDate, gradeFromScore } from "@/lib/domain";
import { RegistrationStatusButton } from "@/components/registration-actions";
import type { RegistrationStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = { PENDING: "Menunggu", VERIFIED: "Terverifikasi", REJECTED: "Ditolak", PAID: "Terbayar", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };

export default function ParticipantsPage() {
  const registrations = listRegistrations();
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Administrasi peserta</div><h1 className="display">Orang-orang<br /><span style={{ color: "var(--blue)" }}>di balik JP.</span></h1><p>Verifikasi pendaftaran dan lihat jejak setiap peserta.</p></div><span className="badge blue"><Users size={13} style={{ verticalAlign: "-2px" }} /> {registrations.length} pendaftaran</span></div>
      {registrations.length ? <div className="table-wrap panel"><table><thead><tr><th>Peserta</th><th>Program</th><th>Terdaftar</th><th>JP diperoleh</th><th>Nilai</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{registrations.map((registration) => <tr key={registration.id}><td><strong>{registration.participant_name}</strong><br /><span className="muted">{registration.participant_institution} · {registration.participant_email}</span></td><td><Link href={`/dashboard/diklat/${registration.training_id}`}>{registration.training_title}</Link></td><td>{formatDate(registration.registered_at)}</td><td><strong>{Math.round(registration.earned_jp)} / {registration.total_jp} JP</strong></td><td>{registration.final_score != null ? <><strong>{registration.final_score}</strong> <span className="muted">({gradeFromScore(registration.final_score)})</span></> : "—"}</td><td><span className={`badge ${registration.status === "COMPLETED" ? "green" : registration.status === "REJECTED" ? "red" : registration.status === "PENDING" ? "orange" : "blue"}`}>{statusLabels[registration.status]}</span></td><td><RegistrationStatusButton registrationId={registration.id} status={registration.status as RegistrationStatus} /></td></tr>)}</tbody></table></div> : <div className="empty-state panel"><Users size={28} style={{ color: "var(--blue)" }} /><h2 className="display">Belum ada peserta.</h2><p>Pendaftaran dari katalog akan muncul di sini setelah peserta mengirim formulir.</p></div>}
    </>
  );
}
