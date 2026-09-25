import Link from "next/link";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { listTrainings } from "@/lib/repository";
import { TrainingCard } from "@/components/training-card";

export const dynamic = "force-dynamic";

export const metadata = { title: "Katalog Diklat" };

export default async function TrainingCatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const filters = await searchParams;
  const allTrainings = listTrainings({ publishedOnly: true });
  const categories = [...new Set(allTrainings.map((training) => training.category))];
  const search = filters.q?.trim().toLowerCase() ?? "";
  const trainings = allTrainings.filter((training) => {
    const matchesCategory = !filters.category || training.category === filters.category;
    const haystack = `${training.title} ${training.subtitle} ${training.description}`.toLowerCase();
    return matchesCategory && (!search || haystack.includes(search));
  });
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Katalog publik</div>
          <h1 className="display">Temukan<br /><span style={{ color: "var(--blue)" }}>ruang tumbuhmu.</span></h1>
          <p>Pelatihan yang bisa dibaca dengan jelas: apa yang dipelajari, kapan berlangsung, berapa JP, dan bagaimana buktinya setelah selesai.</p>
        </div>
      </section>
      <section className="section compact">
        <div className="container">
          <form className="form-actions" style={{ marginBottom: 25, alignItems: "stretch" }}>
            <div className="form-field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="q">Cari diklat</label><input id="q" name="q" defaultValue={filters.q ?? ""} placeholder="Kata kunci atau kategori" /></div>
            <div className="form-field" style={{ minWidth: 180 }}><label htmlFor="category">Kategori</label><select id="category" name="category" defaultValue={filters.category ?? ""}><option value="">Semua kategori</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
            <button className="button secondary" type="submit" style={{ alignSelf: "end", minHeight: 44 }}><SlidersHorizontal size={14} /> Saring</button>
          </form>
          <div className="section-head" style={{ marginBottom: 20 }}><div><div className="eyebrow">{trainings.length} program ditemukan</div><h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", margin: "7px 0 0" }}>Pilih arah.</h2></div><Link className="button small secondary" href="/"><ArrowLeft size={13} /> Beranda</Link></div>
          {trainings.length ? <div className="training-grid">{trainings.map((training, index) => <TrainingCard key={training.id} training={training} index={index} />)}</div> : <div className="empty-state panel"><div className="eyebrow">Belum ada hasil</div><h2 className="display">Coba kata yang lebih luas.</h2><p>Belum menemukan program yang cocok? Kembali ke semua kategori atau cari istilah seperti data, komunikasi, atau kearsipan.</p><Link className="button" href="/diklat">Lihat semua diklat <ArrowRight size={14} /></Link></div>}
        </div>
      </section>
    </>
  );
}
