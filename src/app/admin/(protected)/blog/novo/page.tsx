import { PostEditor } from "@/components/admin/post-editor";
import { listAuthors, listCategories } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
export default async function NewPostPage(){await requireAdmin();const [categories,authors]=await Promise.all([listCategories(),listAuthors()]);return <><header className="admin-heading"><div><span>NOVA PUBLICAÇÃO</span><h1>Criar conteúdo</h1></div></header><PostEditor categories={categories} authors={authors}/></>}
