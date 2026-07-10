import type { Metadata, Viewport } from "next"; import { Geist } from "next/font/google"; import "./globals.css"; import { siteContent as c } from "@/content/landing-page";
const geist=Geist({subsets:["latin"],display:"swap",variable:"--font-geist"}); const url=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
export const metadata:Metadata={metadataBase:new URL(url),title:c.seo.title,description:c.seo.description,alternates:{canonical:"/"},openGraph:{title:c.seo.title,description:c.seo.description,type:"website",locale:"pt_BR",siteName:"Energy"},twitter:{card:"summary",title:c.seo.title,description:c.seo.description},robots:{index:true,follow:true},manifest:"/manifest.webmanifest"};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#0a0a0a"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" className={geist.variable}><body>{children}</body></html>}
