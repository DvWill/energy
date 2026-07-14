"use client";
import { deletePostAction } from "@/app/admin/(protected)/blog/actions";
export function DeletePostForm({ id }: { id: string }) {
  return <form action={deletePostAction.bind(null,id)} onSubmit={(event) => { if (!confirm("Excluir esta publicação permanentemente? Esta ação não pode ser desfeita.")) event.preventDefault(); }}><button className="danger">Excluir</button></form>;
}
