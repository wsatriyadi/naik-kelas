import Link from "next/link";
import { ArrowRight, Check, MoveUpRight, Play } from "lucide-react";
import { listTrainings } from "@/lib/repository";
import { TrainingCard } from "@/components/training-card";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const trainings = listTrainings({ publishedOnly: true });
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Platform pengelolaan diklat</div>
            <h1 className="display display-title">Belajar.<br /><em style={{ color: "var(--blue)", fontStyle: "normal" }}>Naik.</em><br />Terbukti.</h1>
            <p className="body-lead">Satu ruang untuk merancang pelatihan, menuliskan JP, dan menerbitkan sertifikat yang bisa dipercaya.</p>
            <div className="hero-actions">
              <Link className="button" href="/diklat">Jelajahi diklat <ArrowRight size={15} /></Link>
              <Link className="button secondary" href="/alur"><Play size={14} /> Lihat alur belajar</Link>
            </div>
            <div className="hero-note"><span className="pulse-dot" /> Pendaftaran gratis dan berbayar dalam satu katalog</div>
          </div>
          <div className="hero-visual" aria-label="Poster pelatihan contoh">
            <div className="poster-stage">
              <div className="poster-art">
                <div className="poster-top"><span>NAIK KELAS / 2026</span><span className="poster-index">01</span></div>
                <div>
                  <h2 className="display">Manajemen<br /><em>Data</em> Cerdas</h2>
                  <p>Ubah data menjadi keputusan yang dapat dipertanggungjawabkan.</p>
                </div>
                <div className="poster-bottom">
                  <div className="poster-meta"><span>32 JP</span><span>ONLINE</span><span>GRATIS</span></div>
                  <div className="poster-mark">Buka<br />kemungkinan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="container">
          <div className="flow-strip">
            <div className="flow-item"><strong>01 / DAFTAR</strong><p>Pilih program dan lihat JP, biaya, serta syarat sebelum mengambil keputusan.</p></div>
            <div className="flow-item"><strong>02 / HADIR</strong><p>Ikuti sesi, catat kehadiran, dan kumpulkan JP secara transparan.</p></div>
            <div className="flow-item"><strong>03 / TUNJUKKAN</strong><p>Selesaikan tugas dan post-test agar kemampuan terlihat, bukan sekadar hadir.</p></div>
            <div className="flow-item"><strong>04 / TERBITKAN</strong><p>Dapatkan sertifikat dengan QR code yang dapat diperiksa siapa saja.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="katalog">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Katalog terbuka</div><h2 className="display display-section">Mulai dari<br />minatmu.</h2></div>
            <p>Setiap program menampilkan jumlah JP sejak awal. Tidak ada lagi pertanyaan “berapa jam yang sebenarnya?” setelah sertifikat tiba.</p>
          </div>
          <div className="training-grid">
            {trainings.map((training, index) => <TrainingCard key={training.id} training={training} index={index} />)}
          </div>
        </div>
      </section>

      <section className="section compact">
        <div className="container">
          <div className="quote-panel">
            <div><div className="eyebrow">Yang kami jaga</div><div style={{ marginTop: 25, display: "grid", gap: 12 }}><div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12 }}><Check size={15} /> JP tampil di setiap langkah</div><div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12 }}><Check size={15} /> Sertifikat punya identitas</div><div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12 }}><Check size={15} /> Link publik untuk verifikasi</div></div></div>
            <blockquote>“Belajar yang baik tidak berhenti ketika kelas selesai. Ia meninggalkan bukti.”</blockquote>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 25, padding: "36px", background: "var(--lime)", border: "1px solid var(--ink)" }}>
          <div><div className="eyebrow" style={{ color: "var(--ink)" }}>Sudah punya sertifikat?</div><h2 className="display" style={{ margin: "9px 0", fontSize: "clamp(2rem, 4vw, 3.6rem)" }}>Cek aslinya<br />dalam satu klik.</h2><p style={{ maxWidth: 470, margin: 0, color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.55 }}>Masukkan kode dari QR certificate untuk memastikan nama, program, JP, dan status sertifikat.</p></div>
          <Link href="/verifikasi" className="button" style={{ whiteSpace: "nowrap" }}>Verifikasi <MoveUpRight size={15} /></Link>
        </div>
      </section>
    </>
  );
}
