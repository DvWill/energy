import Link from "next/link";
import { duplicatePostAction } from "./actions";
import { DeletePostForm } from "@/components/admin/delete-post-form";
import { listAdminPosts, listCategories } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

function isPubliclyAvailable(item: { status: string; publishedAt: Date | null; scheduledAt: Date | null }, now: Date) {
  if (item.status === "PUBLISHED") return item.publishedAt !== null && item.publishedAt <= now;
  if (item.status === "SCHEDULED") return item.scheduledAt !== null && item.scheduledAt <= now;
  return false;
}

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const [items, categories] = await Promise.all([listAdminPosts({ q: params.q, status: params.status, category: params.category, page: Number(params.page) || 1 }), listCategories()]);
  return <><header className="admin-heading"><div><span>CONTEÚDO</span><h1>Publicações</h1><p>Crie, revise, agende e publique os conteúdos do blog.</p></div><Link className="button" href="/admin/blog/novo">Nova publicação</Link></header>{params.saved && <p className="admin-success" role="status">Publicação salva com sucesso.</p>}<form className="admin-filters"><input name="q" defaultValue={params.q} placeholder="Buscar pelo título" /><select name="status" defaultValue={params.status}><option value="">Todos os status</option><option>DRAFT</option><option>SCHEDULED</option><option>PUBLISHED</option><option>ARCHIVED</option></select><select name="category" defaultValue={params.category}><option value="">Todas as categorias</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><button>Filtrar</button></form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Título</th><th>Categoria</th><th>Autor</th><th>Status</th><th>Publicação</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.categoryName ?? "—"}</td><td>{item.authorName ?? "Equipe Energy"}</td><td><span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.publishedAt?.toLocaleDateString("pt-BR") ?? item.scheduledAt?.toLocaleString("pt-BR") ?? "—"}</td><td>{item.updatedAt.toLocaleDateString("pt-BR")}</td><td><div className="admin-actions"><Link href={`/admin/blog/${item.id}`}>Editar</Link>{isPubliclyAvailable(item, now) && <Link href={`/blog/${item.slug}`} target="_blank" rel="noopener noreferrer">Ver publicação</Link>}<form action={duplicatePostAction.bind(null, item.id)}><button>Duplicar</button></form><DeletePostForm id={item.id} /></div></td></tr>)}</tbody></table>{!items.length && <div className="admin-empty">Nenhuma publicação encontrada.</div>}</div></>;
}
