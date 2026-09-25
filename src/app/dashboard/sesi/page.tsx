import Link from "next/link";
import { ChevronRight, Video } from "lucide-react";
import { getUpcomingSessions, listTrainings, getTrainingById } from "@/lib/repository";
import { formatDate } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default function SessionsPage() {
  const upcoming = getUpcomingSessions(20);
  const trainings = listTrainings().filter((training) => training.status === "PUBLISHED" || training.status === "ONGOING");
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Pelaksanaan & kehadiran</div><h1 className="display">Sesi<br /><span style={{ color: "var(--blue)" }}>yang terhubung.</span></h1><p>Link meeting dikelola manual dan tetap fleksibel untuk Zoom, Google Meet, Teams, atau platform lain.</p></div><span className="badge blue"><Video size={13} style={{ verticalAlign: "-2px" }} /> {upcoming.length} sesi</span></div>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
        <section className="panel"><div className="panel-head"><h2>Agenda sesi</h2><span className="form-hint">Waktu Indonesia</span></div><div className="panel-body"><div className="timeline">{upcoming.length ? upcoming.map((session) => <div className="timeline-item" key={session.id}><div className="timeline-date">{formatDate(session.sessionDate, { day: "2-digit", month: "short" })}</div><div><h3>{session.title}</h3><p>{session.trainingTitle} · {session.startTime}–{session.endTime} · {session.jp} JP</p></div><Link className="form-hint" href={`/dashboard/diklat/${session.trainingId}`}>Kelola <ChevronRight size={12} style={{ verticalAlign: "-2px" }} /></Link></div>) : <p className="muted" style={{ fontSize: 12 }}>Belum ada sesi terjadwal.</p>}</div></div></section>
        <section className="panel"><div className="panel-head"><h2>Per program</h2><span className="form-hint">{trainings.length} aktif</span></div><div className="panel-body"><div className="timeline">{trainings.map((training) => { const detail = getTrainingById(training.id); return <div className="timeline-item" key={training.id}><div className="timeline-date">{detail?.sessions.length ?? 0} sesi</div><div><h3>{training.title}</h3><p>{detail?.sessions.reduce((sum, session) => sum + session.jp, 0) ?? 0} JP total</p></div><Link className="form-hint" href={`/dashboard/diklat/${training.id}`}>→</Link></div>})}</div></div></section>
      </div>
    </>
  );
}
