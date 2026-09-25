"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { loginAction, type ActionState } from "@/lib/actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(loginAction, null);
  return (
    <form action={formAction} className="form-stack">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="form-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="nama@lembaga.go.id" required /></div>
      <div className="form-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Masukkan password" required /></div>
      {state && !state.ok ? <div className="form-error" role="alert">{state.message}</div> : null}
      <button className="button" type="submit" disabled={pending}>{pending ? <LoaderCircle size={15} className="spin" /> : <LogIn size={15} />} {pending ? "Memeriksa…" : "Masuk ke ruang kerja"}</button>
    </form>
  );
}
