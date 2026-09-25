import Link from "next/link";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { getTrainingById, listTrainings, countRegistrations } from "@/lib/repository";
import { formatCurrency, formatDateRange } from "@/lib/domain";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Terbuka", ONGOING: "Berlangsung", COMPLETED: "Selesai", ARCHIVED: "Arsip" };

export default function AdminTrainingsPage() {
  const trainings = listTrainings();
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Program & batch</div><h1 className="display">Kelola<br /><span style={{ color: "var(--blue)" }}>diklat.</span></h1><p>Buat program, atur sesi, dan pantau perjalanan peserta dari satu tempat.</p></div><Link className="button" href="/dashboard/diklat/baru"><Plus size={15} /> Buat diklat</Link></div>
      {trainings.length ? <div className="table-wrap panel"><table><thead><tr><th>Program</th><th>Jadwal</th><th>JP</th><th>Peserta</th><th>Biaya</th><th>Status</th><th /></tr></thead><tbody>{trainings.map((training) => { const detail = getTrainingById(training.id); const jp = detail?.sessions.reduce((sum, session) => sum + session.jp, 0) ?? 0; const registered = countRegistrations(training.id); return <tr key={training.id}><td><strong>{training.title}</strong><br /><span className="muted">{training.category} · {training.facilitator}</span></td><td>{formatDateRange(training.startsAt, training.endsAt)}</td><td><strong>{jp} JP</strong></td><td>{registered}/{training.quota}</td><td>{training.price ? formatCurrency(training.price) : "Gratis"}</td><td><span className={`badge ${training.status === "PUBLISHED" ? "blue" : training.status === "COMPLETED" ? "green" : training.status === "ONGOING" ? "orange" : "gray"}`}>{statusLabels[training.status]}</span></td><td><Link className="button small ghost" href={`/dashboard/diklat/${training.id}`}>Kelola <ArrowRight size={12} /></Link></td></tr>})}</tbody></table></div> : <div className="empty-state panel"><BookOpen size={28} style={{ color: "var(--blue)" }} /><h2 className="display">Belum ada program.</h2><p>Mulai dari judul, jadwal, fasilitator, dan aturan JP. Sesi bisa menyusul setelah draft tersimpan.</p><Link className="button" href="/dashboard/diklat/baru">Buat program pertama <ArrowRight size={14} /></Link></div>}
    </>
  );
}
