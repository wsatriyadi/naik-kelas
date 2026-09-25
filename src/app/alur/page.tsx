import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, BookOpenCheck, ClipboardCheck, QrCode, UserRoundCheck } from "lucide-react";

export const metadata = { title: "Cara Kerja" };

const steps = [
  { icon: BookOpenCheck, label: "01 / RENCANAKAN", title: "Bangun program", body: "Tentukan tujuan, metode, fasilitator, jadwal, kuota, biaya, dan aturan JP. Poster menjadi identitas publik program." },
  { icon: UserRoundCheck, label: "02 / DAFTARKAN", title: "Buka pendaftaran", body: "Peserta melihat program, JP, dan biaya sebelum mendaftar. Status menunggu atau terverifikasi mengikuti jenis program." },
  { icon: ClipboardCheck, label: "03 / HADIRKAN", title: "Catat kehadiran", body: "Fasilitator mencatat kehadiran per sesi. JP diperoleh dihitung dari bobot kehadiran yang benar-benar tercatat." },
  { icon: BarChart3, label: "04 / NILAI", title: "Tunjukkan hasil", body: "Tugas dan post-test digabungkan dengan kehadiran mengikuti bobot program. Batas kelulusan dapat berbeda per diklat." },
  { icon: BadgeCheck, label: "05 / LULUS", title: "Tetapkan hasil", body: "Sistem menghitung nilai akhir dan status lulus. Peserta yang belum memenuhi ambang tidak menerima sertifikat." },
  { icon: QrCode, label: "06 / TERBITKAN", title: "Buat bukti digital", body: "Sertifikat memiliki nomor, tanggal, JP, dan kode QR. Siapa pun dapat memeriksa statusnya melalui halaman verifikasi publik." },
];

export default function FlowPage() {
  return (
    <>
      <section className="page-hero"><div className="container"><div className="eyebrow">Cara kerja</div><h1 className="display">Dari niat<br /><span style={{ color: "var(--blue)" }}>ke bukti.</span></h1><p>Platform ini menghapus langkah yang tidak perlu: satu alur untuk pengelola, peserta, dan penerima sertifikat.</p></div></section>
      <section className="section"><div className="container"><div className="training-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{steps.map(({ icon: Icon, label, title, body }, index) => <div className="panel" key={label} style={{ padding: 24, background: index % 2 === 0 ? "var(--surface)" : index % 4 === 1 ? "var(--lime)" : "var(--blue-soft)" }}><div className="eyebrow" style={{ color: index % 4 === 1 ? "var(--ink)" : "var(--blue)" }}>{label}</div><div style={{ display: "flex", alignItems: "center", gap: 12, margin: "25px 0 14px" }}><span className="session-number"><Icon size={15} /></span><h2 className="display" style={{ margin: 0, fontSize: 30 }}>{title}</h2></div><p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.65 }}>{body}</p></div>)}</div></div></section>
      <section className="section compact"><div className="container"><div className="quote-panel"><div><div className="eyebrow">Langkah berikutnya</div><h2 className="display" style={{ margin: "12px 0 0", fontSize: "clamp(2rem, 4vw, 3.4rem)" }}>Mulai dari<br />satu program.</h2></div><div><p style={{ color: "rgba(255,254,250,.7)", fontSize: 14, lineHeight: 1.6 }}>Tidak perlu menunggu semua modul selesai untuk melihat cara kerjanya. Buat draft, isi sesi, lalu saat peserta lulus, terbitkan sertifikat pertama.</p><Link href="/dashboard/diklat/baru" className="button lime" style={{ marginTop: 17 }}>Buka ruang kerja <ArrowRight size={14} /></Link></div></div></div></section>
    </>
  );
}
