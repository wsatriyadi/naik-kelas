import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { getDashboardStats, getMonthlyParticipantData, getUpcomingSessions, listRecentTrainings } from "@/lib/repository";
import { getCurrentUser } from "@/lib/session";
import { formatDate, formatDateRange, roleLabels } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = getDashboardStats();
  const trainings = listRecentTrainings(4);
  const sessions = getUpcomingSessions(4);
  const monthly = getMonthlyParticipantData();
  const user = await getCurrentUser();
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">{roleLabels[user?.role ?? "LEADER"]}</div><h1 className="display">Selamat datang,<br /><span style={{ color: "var(--blue)" }}>{user?.name.split(" ")[0]}.</span></h1><p>Ringkasan kegiatan, peserta, dan sertifikat yang perlu perhatian Anda.</p></div><Link className="button" href="/dashboard/diklat/baru"><ArrowRight size={15} /> Buat diklat</Link></div>
      <div className="stat-grid"><div className="stat-card"><p>Total diklat</p><strong>{stats.totalTrainings}</strong><small>{stats.activeTrainings} sedang aktif</small></div><div className="stat-card"><p>Peserta terdaftar</p><strong>{stats.totalParticipants}</strong><small>{stats.pendingRegistrations} menunggu verifikasi</small></div><div className="stat-card"><p>Sertifikat terbit</p><strong>{stats.issuedCertificates}</strong><small>{stats.completionRate}% tingkat kelulusan</small></div><div className="stat-card"><p>Rata-rata nilai</p><strong>{stats.averageScore}</strong><small>dari seluruh peserta dinilai</small></div></div>
      <div className="dashboard-grid">
        <section className="panel"><div className="panel-head"><h2>Peserta per bulan</h2><span className="badge blue">Aktivitas</span></div><div className="panel-body"><div className="chart">{monthly.length ? monthly.map((item) => <div className="chart-bar-wrap" key={item.month}><div className="chart-bar" style={{ height: `${Math.max(8, Math.min(100, item.value * 18))}%` }} /><span>{item.month}</span></div>) : <div className="muted" style={{ margin: "auto" }}>Belum ada data</div>}</div></div></section>
        <section className="panel"><div className="panel-head"><h2>Sesi terdekat</h2><Link href="/dashboard/sesi" className="form-hint">Lihat semua →</Link></div><div className="panel-body"><div className="timeline">{sessions.length ? sessions.map((session) => <div className="timeline-item" key={session.id}><div className="timeline-date">{formatDate(session.sessionDate, { day: "2-digit", month: "short" })}</div><div><h3>{session.title}</h3><p>{session.trainingTitle} · {session.startTime}–{session.endTime} · {session.jp} JP</p></div></div>) : <p className="muted" style={{ fontSize: 12 }}>Belum ada sesi terjadwal.</p>}</div></div></section>
      </div>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "1.3fr .7fr" }}><section className="panel"><div className="panel-head"><h2>Program terbaru</h2><Link href="/dashboard/diklat" className="form-hint">Kelola diklat →</Link></div><div className="table-wrap"><table><thead><tr><th>Program</th><th>Jadwal</th><th>Status</th><th> </th></tr></thead><tbody>{trainings.map((training) => <tr key={training.id}><td><strong>{training.title}</strong><br /><span className="muted">{training.category}</span></td><td>{formatDateRange(training.startsAt, training.endsAt)}</td><td><span className={`badge ${training.status === "PUBLISHED" ? "blue" : training.status === "COMPLETED" ? "green" : "gray"}`}>{training.status === "PUBLISHED" ? "Terbuka" : training.status === "COMPLETED" ? "Selesai" : training.status}</span></td><td><Link href={`/dashboard/diklat/${training.id}`} className="form-hint">Buka</Link></td></tr>)}</tbody></table></div></section><section className="panel" style={{ background: "var(--ink)", color: "var(--surface)" }}><div className="panel-head" style={{ borderColor: "rgba(255,255,255,.16)" }}><h2><Award size={16} style={{ verticalAlign: "-3px", color: "var(--lime)" }} /> Jarvisml</h2></div><div className="panel-body"><div className="eyebrow" style={{ color: "var(--lime)" }}>Lebih dari angka</div><p style={{ color: "rgba(255,254,250,.74)", fontSize: 14, lineHeight: 1.6 }}>Setiap sesi adalah percakapan dengan orang yang sedang belajar. Catat kehadiran, nilai, dan JP agar mereka mendapat pengakuan yang:setimbang.</p><Link href="/alur" className="button small lime" style={{ marginTop: 12 }}>Lihat alur lengkap <ArrowRight size={13} /></Link></div></section></div>
    </>
  );
}
