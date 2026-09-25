import Link from "next/link";
import { BarChart3, BookOpen, CalendarDays, ClipboardCheck, FileBadge, LayoutDashboard, LogOut, Settings2, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireUser } from "@/lib/access";
import { logoutAction } from "@/lib/actions";
import { roleLabels } from "@/lib/domain";

const navItems = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/diklat", label: "Kelola diklat", icon: BookOpen },
  { href: "/dashboard/peserta", label: "Peserta", icon: Users },
  { href: "/dashboard/sesi", label: "Sesi & absensi", icon: CalendarDays },
  { href: "/dashboard/sertifikat", label: "Sertifikat", icon: FileBadge },
  { href: "/dashboard/laporan", label: "Laporan", icon: BarChart3 },
];

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = requireUser(await getCurrentUser());
  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand"><Link className="brand" href="/"><span className="brand-mark">↗</span><span>naik kelas</span></Link></div>
          <div className="sidebar-label">Ruang kerja</div>
          <nav className="sidebar-nav" aria-label="Navigasi dashboard">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={15} /> {label}</Link>)}</nav>
          <div className="sidebar-label">Sistem</div>
          <nav className="sidebar-nav"><Link href="/verifikasi"><ClipboardCheck size={15} /> Verifikasi publik</Link><Link href="/dashboard/pengaturan"><Settings2 size={15} /> Pengaturan</Link></nav>
          <div className="sidebar-user"><strong>{user.name}</strong><span>{roleLabels[user.role]} · {user.institution}</span><form action={logoutAction} style={{ marginTop: 12 }}><button className="button small ghost" type="submit"><LogOut size={12} /> Keluar</button></form></div>
        </aside>
        <section className="app-content">{children}</section>
      </div>
    </div>
  );
}
