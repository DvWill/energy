import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
export const metadata: Metadata = { title: "Acesso administrativo | Energy", robots: { index: false, follow: false } };
export default function LoginPage() { return <main className="admin-login"><section><Link href="/">← Voltar ao site</Link><span className="eyebrow">PAINEL ENERGY</span><h1>Acesso administrativo</h1><p>Entre com suas credenciais para gerenciar as publicações.</p><LoginForm /></section></main>; }
