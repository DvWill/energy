import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export function getDb() {
  if (!connectionString) throw new Error("DATABASE_URL não configurada.");
  if (!connectionString.includes("sslmode=require"))
    throw new Error("DATABASE_URL deve exigir SSL.");
  return drizzle(neon(connectionString), { schema });
}
