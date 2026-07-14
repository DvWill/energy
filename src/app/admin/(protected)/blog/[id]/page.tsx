import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { getAdminPost, listAuthors, listCategories } from "@/db/queries";
export default async function EditPostPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const [post,categories,authors]=await Promise.all([getAdminPost(id),listCategories(),listAuthors()]);if(!post)notFound();return <><header className="admin-heading"><div><span>EDIÇÃO</span><h1>{post.title}</h1></div></header><PostEditor post={post} categories={categories} authors={authors}/></>}
