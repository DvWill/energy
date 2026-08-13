import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){if(!(await isAdmin()))return NextResponse.json({message:"Não autorizado."},{status:401});const {id}=await params;await getDb().delete(posts).where(eq(posts.id,id));revalidatePath("/blog");return new NextResponse(null,{status:204})}
