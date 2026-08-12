"use server";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function loginAction(_state: { error: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").slice(0, 200), password = String(formData.get("password") ?? "").slice(0, 200);
  if (!rateLimit(`login:${email.toLowerCase()}`, 5, 15 * 60_000)) return { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
  if (!(await verifyAdminCredentials(email, password))) return { error: "Credenciais inválidas." };
  await createAdminSession(); redirect("/admin/blog");
}
export async function logoutAction() { await destroyAdminSession(); redirect("/admin/login"); }
