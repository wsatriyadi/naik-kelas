"use client";

import { useActionState } from "react";
import { ArrowLeft, Check, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { createTrainingAction, type ActionState } from "@/lib/actions";

export function CreateTrainingForm() {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(createTrainingAction, null);
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Manajemen program</div><h1 className="display">Buat diklat<br /><span style={{ color: "var(--blue)" }}>yang bergerak.</span></h1><p>Mulai dari data esensial. Poster, sesi, dan aturan kelulusan bisa dilengkapi setelah draft dibuat.</p></div><Link className="button secondary" href="/dashboard/diklat"><ArrowLeft size={14} /> Kembali</Link></div>
      <form action={formAction} className="panel" style={{ maxWidth: 900, padding: 24 }}>
        <div className="form-grid">
          <div className="form-field full"><label htmlFor="title">Judul diklat</label><input id="title" name="title" placeholder="Contoh: Manajemen Data Cerdas" required /></div>
          <div className="form-field full"><label htmlFor="subtitle">Subjudul</label><input id="subtitle" name="subtitle" placeholder="Kalimat singkat yang menjelaskan nilai program" required /></div>
          <div className="form-field"><label htmlFor="slug">Slug URL</label><input id="slug" name="slug" placeholder="manajemen-data-cerdas" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></div>
          <div className="form-field"><label htmlFor="category">Kategori</label><input id="category" name="category" placeholder="Kompetensi digital" required /></div>
          <div className="form-field full"><label htmlFor="description">Deskripsi</label><textarea id="description" name="description" placeholder="Apa yang akan dipelajari dan bagaimana praktik dilakukan?" required /></div>
          <div className="form-field full"><label htmlFor="objectives">Tujuan pembelajaran <span className="muted">(satu per baris)</span></label><textarea id="objectives" name="objectives" placeholder={"Menyusun indikator\nMembaca data secara kritis"} required /></div>
          <div className="form-field"><label htmlFor="method">Metode</label><select id="method" name="method" defaultValue="ONLINE"><option value="ONLINE">Online</option><option value="OFFLINE">Offline</option><option value="HYBRID">Hybrid</option></select></div>
          <div className="form-field"><label htmlFor="platform">Platform</label><select id="platform" name="platform" defaultValue="ZOOM"><option value="ZOOM">Zoom</option><option value="GOOGLE_MEET">Google Meet</option><option value="MICROSOFT_TEAMS">Microsoft Teams</option><option value="OTHER">Lainnya</option><option value="ONSITE">Onsite</option></select></div>
          <div className="form-field"><label htmlFor="facilitator">Fasilitator /trainer</label><input id="facilitator" name="facilitator" placeholder="Nama fasilitator" required /></div>
          <div className="form-field"><label htmlFor="location">Lokasi <span className="muted">(opsional)</span></label><input id="location" name="location" placeholder="Ruang / kota" /></div>
          <div className="form-field"><label htmlFor="quota">Kuota peserta</label><input id="quota" name="quota" type="number" min="1" defaultValue="30" required /></div>
          <div className="form-field"><label htmlFor="price">Biaya (Rp)</label><input id="price" name="price" type="number" min="0" defaultValue="0" required /></div>
          <div className="form-field"><label htmlFor="startsAt">Mulai</label><input id="startsAt" name="startsAt" type="date" required /></div>
          <div className="form-field"><label htmlFor="endsAt">Selesai</label><input id="endsAt" name="endsAt" type="date" required /></div>
          <div className="form-field"><label htmlFor="registrationDeadline">Batas pendaftaran</label><input id="registrationDeadline" name="registrationDeadline" type="date" required /></div>
          <div className="form-field"><label htmlFor="passScore">Nilai minimum lulus</label><input id="passScore" name="passScore" type="number" min="0" max="100" defaultValue="70" required /></div>
          <div className="form-field"><label htmlFor="minimumAttendanceJp">JP minimum hadir</label><input id="minimumAttendanceJp" name="minimumAttendanceJp" type="number" min="0" defaultValue="0" required /></div>
          <div className="form-field"><label htmlFor="certificateLabel">Label sertifikat</label><input id="certificateLabel" name="certificateLabel" defaultValue="Sertifikat Pelatihan" required /></div>
          <div className="form-field"><label htmlFor="posterTone">Warna poster</label><select id="posterTone" name="posterTone" defaultValue="indigo"><option value="indigo">Indigo / lime</option><option value="teal">Teal / coral</option><option value="orange">Orange / cream</option><option value="plum">Plum / lime</option></select></div>
        </div>
        {state && !state.ok ? <div className="form-error" style={{ marginTop: 16 }} role="alert">{state.message}{state.fieldErrors ? Object.entries(state.fieldErrors).map(([field, errors]) => <div key={field}><strong>{field}</strong>: {errors.join(", ")}</div>) : null}</div> : null}
        <div className="form-actions" style={{ marginTop: 25, paddingTop: 20, borderTop: "1px solid var(--line)" }}><button className="button" type="submit" disabled={pending}>{pending ? <LoaderCircle size={15} className="spin" /> : <Plus size={15} />} {pending ? "Menyimpan…" : "Simpan sebagai draft"}</button><span className="form-hint"><Check size={12} style={{ verticalAlign: "-2px" }} /> Sesi dan poster dapat ditambahkan setelah draft dibuat.</span></div>
      </form>
    </>
  );
}
