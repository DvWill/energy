import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { CompanySection } from "@/components/landing/company-section";
import { Benefits, Contact, Differentiators, Evidence, FinalCta, Hero, ProblemSolution, Process } from "@/components/landing/landing-sections";

export default function Home(){return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><SiteHeader/><main id="conteudo"><Hero/><ProblemSolution/><SolutionsSection/><Benefits/><CompanySection/><Process/><Differentiators/><Evidence/><FaqSection/><FinalCta/><Contact/></main><SiteFooter/></>}
