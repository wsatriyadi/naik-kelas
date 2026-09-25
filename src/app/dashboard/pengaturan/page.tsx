import { Settings2, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireRole } from "@/lib/access";
import { roleLabels } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  return (
    <>
      <div className="content-head"><div><div className="eyebrow">Konfigurasi ruang kerja</div><h1 className="display">Pengaturan<br /><span style={{ color: "var(--blue)" }}>yang tenang.</span></h1><p>Identitas, hak akses, dan konvensi data untuk administrator.</p></div><Settings2 size={24} style={{ color: "var(--blue)" }} /></div>
      <div className="dashboard-grid"><section className="panel"><div className="panel-head"><h2>Profil administrator</h2><ShieldCheck size={16} style={{ color: "var(--blue)" }} /></div><div className="panel-body"><div className="sidebar-list"><div><dt>Nama</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Peran</dt><dd>{roleLabels[user.role]}</dd></div><div><dt>Lembaga</dt><dd>{user.institution}</dd></div></div></div></section><section className="panel" style={{ background: "var(--lime)" }}><div className="panel-head" style={{ borderColor: "rgba(20,21,27,.2)" }}><h2>Prinsip data</h2></div><div className="panel-body"><p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.65 }}>JP dicatat dari sesi dan kehadiran, bukan diketik bebas di sertifikat. Nilai akhir mengikuti bobot yang terlihat di program. Sertifikat baru terbit ketika peserta lulus.</p></div></section></div>
    </>
  );
}
