import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";

export function SolutionsSection() {
  return <section id="solucoes" className="section solutions-section"><Container><div className="solutions-intro"><div className="section-heading"><span>ONDE A ENERGY ATUA</span><h2>Soluções solares para diferentes necessidades.</h2></div><p>Da análise inicial ao cuidado com o sistema, cada etapa começa pelo entendimento do seu contexto.</p></div><div className="solutions-list">{c.solutions.map((item, index) => <article className="solution-card" key={item.title}><div className="solution-media"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="solution-copy"><span>{String(index + 1).padStart(2, "0")} / {item.eyebrow}</span><h3>{item.title}</h3><p>{item.text}</p><a href="#contato">Conversar sobre esta solução <ArrowUpRight aria-hidden="true" /></a></div></article>)}</div></Container></section>;
}
