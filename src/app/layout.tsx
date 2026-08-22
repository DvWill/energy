import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "./founders.css";
import "./blog.css";
import "./landing-enhancements.css";
import { siteContent as c } from "@/content/landing-page";
import { withBasePath } from "@/lib/base-path";
import { connection } from "next/server";
import { headers } from "next/headers";
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});
const url = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: c.seo.title,
  description: c.seo.description,
  alternates: { canonical: url },
  openGraph: {
    title: c.seo.title,
    description: c.seo.description,
    type: "website",
    locale: "pt_BR",
    siteName: "Energy",
    url,
  },
  twitter: {
    card: "summary",
    title: c.seo.title,
    description: c.seo.description,
  },
  robots: { index: true, follow: true },
  manifest: withBasePath("/manifest.webmanifest"),
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f95f1b",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.GITHUB_PAGES !== "true") await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="pt-BR"
      className={geist.variable}
      data-theme="light"
      data-scroll-behavior="smooth"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style nonce={nonce}>{`
            [data-motion-reveal], [data-motion-hero],
            [data-motion-text], [data-motion-text] *,
            [data-motion-image], [data-motion-image] *,
            [data-motion-parallax], [data-motion-carousel] {
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
            }
            [data-motion-accordion] {
              height: auto !important;
              opacity: 1 !important;
            }
            .faq-answer { overflow: visible !important; }
            .menu-button { display: none !important; }
            @media (max-width: 1100px) {
              .site-header .desktop-nav { display: none !important; }
              .site-header .mobile-nav {
                display: flex !important;
                height: auto !important;
                opacity: 1 !important;
                transform: none !important;
                visibility: visible !important;
                pointer-events: auto !important;
              }
            }
          `}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
