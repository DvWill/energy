"use client";
import { useActionState } from "react";
import { saveCategoryAction } from "@/app/admin/(protected)/blog/actions";
export function CategoryForm() { const [state,action,pending]=useActionState(saveCategoryAction,{error:""}); return <form action={action} className="category-form"><label>Nome<input name="name" required maxLength={80} /></label><label>Slug<input name="slug" maxLength={100} placeholder="Gerado pelo nome" /></label><label>Descrição<textarea name="description" maxLength={300} /></label>{state.error && <p role="alert" className="admin-error">{state.error}</p>}<button className="button" disabled={pending}>{pending ? "Salvando…" : "Criar categoria"}</button></form>; }
