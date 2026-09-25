import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const { redirectTo } = await searchParams;
  return (
    <div className="auth-page">
      <section className="auth-art">
        <Link className="brand" href="/"><span className="brand-mark">↗</span><span>naik kelas</span></Link>
        <div className="auth-art-copy"><div className="eyebrow" style={{ color: "var(--lime)" }}>Satu alur, banyak kemungkinan</div><h1 className="display">Tumbuh<br /><span style={{ color: "var(--lime)" }}>terukur.</span></h1><p>Kelola pelatihan, peserta, JP, dan sertifikat dalam satu ruang yang rapi dan mudah dipahami.</p></div>
        <div className="auth-footer">Portal pengelolaan diklat · 2026</div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap"><div className="eyebrow">Selamat datang kembali</div><h2 className="display">Masuk ke<br />ruangmu.</h2><p>Gunakan akun yang diberikan oleh administer untuk melanjutkan.</p><LoginForm redirectTo={redirectTo} /><div style={{ marginTop: 25, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11 }}><Link href="/" style={{ color: "var(--muted)" }}>← Kembali ke beranda</Link><Link href="/verifikasi" style={{ color: "var(--blue)", fontWeight: 800 }}>Verifikasi sertifikat <ArrowUpRight size={12} style={{ verticalAlign: "-2px" }} /></Link></div></div>
      </section>
    </div>
  );
}
