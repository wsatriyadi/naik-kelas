import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getTrainingBySlug, getParticipantRegistrations } from "@/lib/repository";
import { getCurrentUser } from "@/lib/session";
import { formatCurrency, formatDate, formatDateRange } from "@/lib/domain";
import { RegisterTrainingButton } from "@/components/register-training-button";

export const dynamic = "force-dynamic";

interface TrainingDetailPageProps { params: Promise<{ slug: string }> }

export default async function TrainingDetailPage({ params }: TrainingDetailPageProps) {
  const { slug } = await params;
  const training = getTrainingBySlug(slug, { publicOnly: true });
  if (!training) notFound();
  const user = await getCurrentUser();
  const registration = user?.role === "PARTICIPANT" ? getParticipantRegistrations(user.id).find((item) => item.trainingId === training.id) : undefined;
  const totalJp = training.sessions.reduce((total, session) => total + session.jp, 0);
  const isOpen = training.status === "PUBLISHED" && training.registrationDeadline > new Date().toISOString();
  const objectives = training.objectives.split(/\r?\n/).filter(Boolean);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Link href="/diklat" className="button small secondary" style={{ marginBottom: 30 }}><ArrowLeft size={13} /> Kembali ke katalog</Link>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 30, alignItems: "end" }}>
            <div><div className="eyebrow">{training.category} · {training.status === "PUBLISHED" ? "Pendaftaran dibuka" : "Program selesai"}</div><h1 className="display">{training.title}</h1><p>{training.subtitle}</p></div>
            <div className="poster-art" style={{ minHeight: 280, width: 330, padding: 20, boxShadow: "12px 12px 0 var(--ink)", transform: "rotate(2deg)" }}><div className="poster-top"><span>NAIK KELAS / 2026</span><span className="poster-index">01</span></div><div><h2 className="display" style={{ fontSize: 36, margin: "32px 0 0" }}>{training.title}</h2><p style={{ marginTop: 8 }}>{training.subtitle}</p></div><div className="poster-bottom"><div className="poster-meta"><span>{totalJp} JP</span><span>{training.price ? formatCurrency(training.price) : "GRATIS"}</span></div></div></div>
          </div>
        </div>
      </section>
      <section className="detail-grid container">
        <div className="detail-copy">
          <h2 className="display" style={{ fontSize: "clamp(2.3rem, 4vw, 4rem)", margin: "0 0 22px" }}>Belajar yang<br /><span style={{ color: "var(--blue)" }}>berdampak.</span></h2>
          <p>{training.description}</p>
          <h2 style={{ marginTop: 38 }}>Yang akan kamu kuasai</h2>
          <ul className="objectives">{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          <h2 style={{ marginTop: 38 }}>Rincian sesi & JP</h2>
          <div className="session-list">{training.sessions.map((session, index) => <div className="session-row" key={session.id}><span className="session-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{session.title}</h3><p>{formatDate(session.sessionDate)} · {session.startTime}–{session.endTime} · {session.platform === "ZOOM" ? "Zoom" : session.platform === "GOOGLE_MEET" ? "Google Meet" : session.platform === "MICROSOFT_TEAMS" ? "Microsoft Teams" : "Online"}</p></div><span className="session-jp">{session.jp} JP</span></div>)}</div>
          <h2 style={{ marginTop: 38 }}>Aturan kelulusan</h2>
          <p>Nilai akhir dihitung dari kehadiran {training.attendanceWeight}%, tugas {training.taskWeight}%, dan post-test {training.postTestWeight}%. Nilai minimum untuk lulus adalah {training.passScore}.</p>
        </div>
        <aside className="detail-sidebar">
          <div className="eyebrow">Ringkasan program</div>
          <h2>Siap untuk<br />naik?</h2>
          <dl className="sidebar-list"><div><dt>Waktu</dt><dd>{formatDateRange(training.startsAt, training.endsAt)}</dd></div><div><dt>JP</dt><dd>{totalJp} JP</dd></div><div><dt>Metode</dt><dd>{training.method === "ONLINE" ? "Online" : training.method === "HYBRID" ? "Hybrid" : "Offline"}</dd></div><div><dt>Biaya</dt><dd>{training.price ? formatCurrency(training.price) : "Gratis"}</dd></div><div><dt>Kuota</dt><dd>{training.quota} peserta</dd></div><div><dt>Fasilitator</dt><dd>{training.facilitator}</dd></div></dl>
          {registration ? <div className="form-success" style={{ marginTop: 18, padding: 12, background: "var(--lime)" }}><strong>Status: {registration.status === "PENDING" ? "Menunggu verifikasi" : "Sudah terdaftar"}</strong><br />Progress peserta akan muncul di dashboard.</div> : <RegisterTrainingButton trainingId={training.id} disabled={!isOpen || Boolean(user && user.role !== "PARTICIPANT")} /> }
          <div className="form-hint" style={{ marginTop: 12 }}><CalendarDays size={12} style={{ verticalAlign: "-2px" }} /> Batas pendaftaran {formatDate(training.registrationDeadline)}</div>
        </aside>
      </section>
    </>
  );
}
