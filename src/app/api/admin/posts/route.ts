import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listAdminPosts } from "@/db/queries";
export async function GET(request:Request){if(!(await isAdmin()))return NextResponse.json({message:"Não autorizado."},{status:401});const url=new URL(request.url);return NextResponse.json(await listAdminPosts({q:url.searchParams.get("q")??undefined,status:url.searchParams.get("status")??undefined,category:url.searchParams.get("category")??undefined,page:Number(url.searchParams.get("page"))||1}))}
