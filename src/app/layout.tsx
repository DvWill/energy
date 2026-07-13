import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { siteContent as c } from "@/content/landing-page";
import { withBasePath } from "@/lib/base-path";
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});
const url = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
const themeScript = `(function(){try{var saved=localStorage.getItem("energy-theme");var theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var root=document.documentElement;root.dataset.theme=theme;root.style.colorScheme=theme;}catch(e){}})();`;
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
  themeColor: "#061522",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={geist.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <noscript>
          <style>{`
            [data-motion-reveal], [data-motion-hero] {
              opacity: 1 !important;
              transform: none !important;
            }
            [data-motion-accordion] {
              height: auto !important;
              opacity: 1 !important;
            }
            .faq-answer { overflow: visible !important; }
            .menu-button { display: none !important; }
            @media (max-width: 850px) {
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
