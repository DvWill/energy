"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return <form action={action} className="admin-login-form"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={200} /><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} />{state.error && <p className="admin-error" role="alert">{state.error}</p>}<button className="button" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button></form>;
}
