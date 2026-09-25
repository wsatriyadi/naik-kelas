import Link from "next/link";
import { Award, BookOpen, Home, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireUser } from "@/lib/access";
import { logoutAction } from "@/lib/actions";

export default async function ParticipantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = requireUser(await getCurrentUser());
  return <div className="app-shell"><header className="site-header"><div className="container site-header-inner"><Link href="/peserta" className="brand"><span className="brand-mark">↗</span><span>naik kelas</span></Link><nav className="nav-links" aria-label="Navigasi peserta"><Link href="/peserta"><Home size={14} /> Dashboard</Link><Link href="/diklat"><BookOpen size={14} /> Cari diklat</Link><Link href="/peserta/sertifikat"><Award size={14} /> Sertifikat</Link></nav><div className="nav-actions"><span className="form-hint">{user.name}</span><form action={logoutAction}><button className="button small secondary" type="submit"><LogOut size={12} /> Keluar</button></form></div></div></header>{children}</div>;
}
