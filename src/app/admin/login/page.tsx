import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Acesso administrativo | Energy",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="admin-login">
      <section aria-labelledby="admin-login-title">
        <Link className="admin-login-back" href="/">
          <ArrowLeft aria-hidden="true" />
          Voltar ao site
        </Link>
        <div className="admin-login-brand" aria-hidden="true">
          <Image
            src={withBasePath("/brand/energy-symbol-orange.png")}
            alt=""
            width={42}
            height={42}
          />
          <span>ENERGY</span>
        </div>
        <span className="admin-login-kicker">Painel administrativo</span>
        <h1 id="admin-login-title">Bem-vindo de volta</h1>
        <p>Entre com suas credenciais para gerenciar as publicações.</p>
        <LoginForm />
      </section>
    </main>
  );
}
