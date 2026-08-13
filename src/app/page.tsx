import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { CompanySection } from "@/components/landing/company-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LeadExperience } from "@/components/landing/lead-experience";
import { MetricsSection } from "@/components/landing/metrics-section";
import { siteContent as c } from "@/content/landing-page";
import {
  Benefits,
  Differentiators,
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
      <main id="conteudo" className="home-flow">
        <HeroSection primaryCta={c.cta.primary} />
        <LeadExperience />
        <MetricsSection />
        <ProblemSolution />
        <SolutionsSection />
        <Benefits />
        <CompanySection />
        <Process />
        <Differentiators />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
