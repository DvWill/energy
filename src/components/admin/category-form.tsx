"use client";
import { useActionState } from "react";
import { saveCategoryAction } from "@/app/admin/(protected)/blog/actions";

export function CategoryForm() {
  const [state, action, pending] = useActionState(saveCategoryAction, {
    error: "",
  });
  return (
    <form action={action} className="category-form">
      <header>
        <h2>Nova categoria</h2>
        <p>Crie uma categoria para agrupar publicações relacionadas.</p>
      </header>
      <label htmlFor="category-name">Nome</label>
      <input id="category-name" name="name" required maxLength={80} />
      <label htmlFor="category-slug">Slug</label>
      <input
        id="category-slug"
        name="slug"
        maxLength={100}
        placeholder="Gerado automaticamente pelo nome"
      />
      <label htmlFor="category-description">Descrição</label>
      <textarea
        id="category-description"
        name="description"
        maxLength={300}
        rows={4}
      />
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "Salvando…" : "Criar categoria"}
      </button>
    </form>
  );
}
