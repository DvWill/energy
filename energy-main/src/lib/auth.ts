import "server-only";
import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "energy_admin_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET inválido ou ausente.");
  return new TextEncoder().encode(value);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !hash || email.trim().toLowerCase() !== expectedEmail) return false;
  return compare(password, hash);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}

export async function destroyAdminSession() { (await cookies()).delete(COOKIE); }

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try { const { payload } = await jwtVerify(token, secret()); return payload.role === "admin"; } catch { return false; }
}

export async function requireAdmin() { if (!(await isAdmin())) redirect("/admin/login"); }
