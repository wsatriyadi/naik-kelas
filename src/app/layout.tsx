import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Naik Kelas — Platform Diklat", template: "%s · Naik Kelas" },
  description: "Kelola diklat, hitung JP, dan terbitkan sertifikat yang dapat diverifikasi.",
  openGraph: { title: "Naik Kelas — Platform Diklat", description: "Dari pendaftaran sampai sertifikat, satu alur yang jelas." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <header className="site-header">
          <div className="container site-header-inner">
            <Link href="/" className="brand" aria-label="Naik Kelas, beranda">
              <span className="brand-mark" aria-hidden="true">↗</span>
              <span>naik kelas</span>
            </Link>
            <nav className="nav-links" aria-label="Navigasi utama">
              <Link href="/diklat">Katalog diklat</Link>
              <Link href="/alur">Cara kerja</Link>
              <Link href="/verifikasi">Verifikasi sertifikat</Link>
            </nav>
            <div className="nav-actions">
              <Link className="button small secondary" href="/masuk">Masuk <ArrowUpRight size={13} /></Link>
            </div>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="container" style={{ padding: "35px 0 55px", borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <span>© {new Date().getFullYear()} Naik Kelas · Ruang tumbuh untuk belajar</span>
            <span>Setiap JP tercatat. Setiap sertifikat dapat diverifikasi.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
