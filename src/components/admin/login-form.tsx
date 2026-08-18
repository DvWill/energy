"use client";
import { LockKeyhole, UserRound } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "@/app/admin/login/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="admin-login-form">
      <label htmlFor="username">Usuário</label>
      <div className="admin-login-control">
        <UserRound aria-hidden="true" />
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          maxLength={200}
          autoCapitalize="none"
          spellCheck={false}
        />
      </div>
      <label htmlFor="password">Senha</label>
      <div className="admin-login-control">
        <LockKeyhole aria-hidden="true" />
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </div>
      {state.error && (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
