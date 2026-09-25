"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { updateRegistrationStatusAction, type ActionState } from "@/lib/actions";
import type { RegistrationStatus } from "@/lib/domain";

export function RegistrationStatusButton({ registrationId, status }: { registrationId: number; status: RegistrationStatus }) {
  const nextStatus: RegistrationStatus = status === "PENDING" ? "VERIFIED" : status === "VERIFIED" ? "COMPLETED" : status === "COMPLETED" ? "REJECTED" : "VERIFIED";
  const label: Record<RegistrationStatus, string> = { PENDING: "Verifikasi", VERIFIED: "Tandai selesai", REJECTED: "Verifikasi", PAID: "Aktifkan", COMPLETED: "Tolak", CANCELLED: "Aktifkan" };
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(updateRegistrationStatusAction, null);
  return <form action={formAction} style={{ display: "inline" }}><input type="hidden" name="registrationId" value={registrationId} /><input type="hidden" name="status" value={nextStatus} /><button className="button small ghost" type="submit" disabled={pending} title={state?.message}>{pending ? <LoaderCircle size={12} /> : status === "COMPLETED" ? <X size={12} /> : <Check size={12} />} {label[status]}</button></form>;
}
