import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { getAdminPost, listAuthors, listCategories } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [post, categories, authors] = await Promise.all([
    getAdminPost(id),
    listCategories(),
    listAuthors(),
  ]);
  if (!post) notFound();

  const imageUploadsEnabled = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
  return (
    <>
      <header className="admin-heading">
        <div>
          <span>EDIÇÃO</span>
          <h1>{post.title}</h1>
          <p>Atualize o conteúdo e confira o checklist antes de publicar.</p>
        </div>
      </header>
      <PostEditor
        post={post}
        categories={categories}
        authors={authors}
        imageUploadsEnabled={imageUploadsEnabled}
      />
    </>
  );
}
