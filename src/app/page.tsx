import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { CompanySection } from "@/components/landing/company-section";
import { HeroSection } from "@/components/landing/hero-section";
import { siteContent as c } from "@/content/landing-page";
import {
  Benefits,
  Contact,
  Differentiators,
  Evidence,
  FinalCta,
  ProblemSolution,
  Process,
} from "@/components/landing/landing-sections";

export default function Home() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">
        <HeroSection primaryCta={c.cta.primary} />
        <ProblemSolution />
        <SolutionsSection />
        <Benefits />
        <CompanySection />
        <Process />
        <Differentiators />
        <Evidence />
        <FaqSection />
        <FinalCta />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
