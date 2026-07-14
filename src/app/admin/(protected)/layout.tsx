import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../login/actions";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-brand">ENERGY</Link><nav><Link href="/admin/blog">Publicações</Link><Link href="/admin/blog/novo">Nova publicação</Link><Link href="/admin/blog/categorias">Categorias</Link><Link href="/blog" target="_blank" rel="noopener noreferrer">Ver blog ↗</Link></nav><form action={logoutAction}><button type="submit">Sair</button></form></aside><main className="admin-main">{children}</main></div>;
}
