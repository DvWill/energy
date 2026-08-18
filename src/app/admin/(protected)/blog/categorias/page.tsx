import { CategoryForm } from "@/components/admin/category-form";
import { listCategories } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import { deleteCategoryAction } from "../actions";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();
  return (
    <>
      <header className="admin-heading">
        <div>
          <span>ORGANIZAÇÃO</span>
          <h1>Categorias</h1>
          <p>Organize os conteúdos sem cadastrar categorias fictícias.</p>
        </div>
      </header>
      <div className="category-layout">
        <CategoryForm />
        <section
          className="category-list"
          aria-labelledby="category-list-title"
        >
          <header>
            <div>
              <h2 id="category-list-title">Categorias existentes</h2>
              <p>
                {categories.length} cadastrada
                {categories.length === 1 ? "" : "s"}
              </p>
            </div>
          </header>
          {categories.map((item) => (
            <article className="category-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>/{item.slug}</span>
                {item.description && <p>{item.description}</p>}
              </div>
              <form action={deleteCategoryAction.bind(null, item.id)}>
                <button className="danger">Excluir</button>
              </form>
            </article>
          ))}
          {!categories.length && (
            <p className="category-empty">Nenhuma categoria cadastrada.</p>
          )}
        </section>
      </div>
    </>
  );
}
