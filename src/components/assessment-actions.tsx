"use client";

import { useActionState, useState } from "react";
import { Award, Check, ClipboardCheck, LoaderCircle } from "lucide-react";
import { issueCertificateAction, recordAttendanceAction, recordScoresAction, type ActionState } from "@/lib/actions";
import type { AttendanceStatus } from "@/lib/domain";

const attendanceOptions: Array<{ value: AttendanceStatus; label: string }> = [{ value: "PRESENT", label: "Hadir" }, { value: "LATE", label: "Terlambat" }, { value: "EXCUSED", label: "Izin" }, { value: "ABSENT", label: "Alpa" }];

export function AssessmentActions({ registrationId, sessionId }: { registrationId: number; sessionId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(recordAttendanceAction, null);
  if (!open) return <button type="button" className="button small ghost" onClick={() => setOpen(true)}><ClipboardCheck size={12} /> Absen</button>;
  return <form action={formAction} style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}><input type="hidden" name="registrationId" value={registrationId} /><input type="hidden" name="sessionId" value={sessionId} /><select name="status" defaultValue="PRESENT" aria-label="Status kehadiran" style={{ minHeight: 35, border: "1px solid var(--line)", padding: "0 6px", fontSize: 11 }}>{attendanceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button className="button small" type="submit" disabled={pending}>{pending ? <LoaderCircle size={12} /> : <Check size={12} />} Simpan</button><button className="button small ghost" type="button" onClick={() => setOpen(false)}>Batal</button>{state ? <span className={state.ok ? "form-success" : "form-error"}>{state.message}</span> : null}</form>;
}

export function ScoreAndCertificateActions({ registrationId, hasResult, hasCertificate }: { registrationId: number; hasResult: boolean; hasCertificate: boolean }) {
  const [open, setOpen] = useState(false);
  const [scoreState, scoreAction, scorePending] = useActionState<ActionState | null, FormData>(recordScoresAction, null);
  const [certificateState, certificateAction, certificatePending] = useActionState<ActionState | null, FormData>(issueCertificateAction, null);
  return <div style={{ display: "inline-flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}><button type="button" className="button small ghost" onClick={() => setOpen((value) => !value)} disabled={scorePending}><ClipboardCheck size={12} /> {hasResult ? "Ubah nilai" : "Nilai"}</button>{hasResult ? <form action={certificateAction}><input type="hidden" name="registrationId" value={registrationId} /><button className="button small lime" type="submit" disabled={certificatePending}>{certificatePending ? <LoaderCircle size={12} /> : <Award size={12} />} {hasCertificate ? "Terbitkan" : "Sertifikat"}</button></form> : null}{open ? <form action={scoreAction} style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}><input type="hidden" name="registrationId" value={registrationId} /><input name="task" type="number" min="0" max="100" placeholder="Tugas" defaultValue={80} style={{ width: 70, minHeight: 35, border: "1px solid var(--line)", padding: "0 6px", fontSize: 11 }} /><input name="postTest" type="number" min="0" max="100" placeholder="Post-test" defaultValue={80} style={{ width: 70, minHeight: 35, border: "1px solid var(--line)", padding: "0 6px", fontSize: 11 }} /><button className="button small" type="submit" disabled={scorePending}>{scorePending ? <LoaderCircle size={12} /> : <Check size={12} />} Simpan</button></form> : null}{scoreState ? <span className={scoreState.ok ? "form-success" : "form-error"}>{scoreState.message}</span> : null}{certificateState ? <span className={certificateState.ok ? "form-success" : "form-error"}>{certificateState.message}</span> : null}</div>;
}
