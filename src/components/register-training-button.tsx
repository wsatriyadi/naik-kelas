"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { registerTrainingAction, type ActionState } from "@/lib/actions";

interface RegisterTrainingButtonProps { trainingId: number; disabled?: boolean }

export function RegisterTrainingButton({ trainingId, disabled = false }: RegisterTrainingButtonProps) {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(registerTrainingAction, null);
  if (state?.ok) return <div className="form-success"><CheckCircle2 size={16} style={{ verticalAlign: "-3px" }} /> {state.message}</div>;
  return <form action={formAction}><input type="hidden" name="trainingId" value={trainingId} /><button className="button" type="submit" disabled={disabled || pending}>{pending ? <LoaderCircle size={15} className="spin" /> : <ArrowRight size={15} />} Daftar sekarang</button>{state && !state.ok ? <div className="form-error" style={{ marginTop: 9 }}>{state.message}</div> : null}</form>;
}
