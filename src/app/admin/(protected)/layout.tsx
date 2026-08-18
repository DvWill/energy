import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { requireAdmin } from "@/lib/auth";
import { withBasePath } from "@/lib/base-path";
import { logoutAction } from "../login/actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link
          href="/"
          className="admin-brand"
          aria-label="Voltar ao site Energy"
        >
          <Image
            src={withBasePath("/brand/energy-symbol-orange.png")}
            alt=""
            width={32}
            height={32}
          />
          <span>
            <strong>Energy</strong>
            <small>Painel administrativo</small>
          </span>
        </Link>
        <AdminNavigation />
        <form action={logoutAction} className="admin-logout">
          <button type="submit">
            <LogOut aria-hidden="true" />
            <span>Sair</span>
          </button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
