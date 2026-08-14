import { PostEditor } from "@/components/admin/post-editor";
import { listAuthors, listCategories } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

export default async function NewPostPage() {
  await requireAdmin();
  const [categories, authors] = await Promise.all([
    listCategories(),
    listAuthors(),
  ]);
  const imageUploadsEnabled = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );

  return (
    <>
      <header className="admin-heading">
        <div>
          <span>NOVA PUBLICAÇÃO</span>
          <h1>Criar conteúdo</h1>
          <p>
            Escreva com calma, salve um rascunho quando quiser e publique apenas
            quando o checklist estiver completo.
          </p>
        </div>
      </header>
      <PostEditor
        categories={categories}
        authors={authors}
        imageUploadsEnabled={imageUploadsEnabled}
      />
    </>
  );
}
