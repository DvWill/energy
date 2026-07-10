"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";

const slides = [
  { src: "/images/company/energy-team.png", alt: "Equipe Energy na recepção da empresa", eyebrow: "QUEM SOMOS", title: "Estrutura real. Contato humano.", text: "Um ambiente preparado para receber demandas, desenvolver projetos e aproximar pessoas das decisões sobre energia." },
  { src: "/images/company/01Planejamento.png", alt: "Ambiente de planejamento da Energy", eyebrow: "PLANEJAMENTO", title: "Cada projeto começa com contexto.", text: "Organização e análise para transformar necessidades em próximos passos claros." },
  { src: "/images/company/02Conhecimento técnico.png", alt: "Profissional da Energy apresentando um inversor solar", eyebrow: "CONHECIMENTO TÉCNICO", title: "Tecnologia explicada com clareza.", text: "A proximidade entre pessoas e equipamentos faz parte de uma decisão mais bem orientada." },
  { src: "/images/company/03Novas tecnologias.png", alt: "Carregador elétrico de parede em demonstração", eyebrow: "NOVAS TECNOLOGIAS", title: "Energia em constante evolução.", text: "Acompanhamos tecnologias que ampliam as possibilidades de uso inteligente da energia." },
  { src: "/images/company/04Atendimento próximo.png", alt: "Profissional de atendimento com a identidade da Energy", eyebrow: "ATENDIMENTO", title: "Uma conversa próxima desde o início.", text: "Pessoas preparadas para ouvir, organizar informações e conectar você à equipe certa." },
] as const;

export function CompanySection() {
  const [active, setActive] = useState(0);
  const go = (next: number) => setActive((next + slides.length) % slides.length);
  const slide = slides[active];
  return <section id="quem-somos" className="section company-section" aria-labelledby="company-title"><Container><div className="company-lead"><div><span className="eyebrow dark">CONHEÇA A ENERGY</span><h2 id="company-title">Quem somos?</h2><h3>Pessoas e técnica para transformar boas escolhas em projetos de energia.</h3></div><p>Uma equipe próxima, preparada para entender cada contexto e organizar os próximos passos com clareza.</p></div><div className="company-carousel" role="region" aria-roledescription="carrossel" aria-label="Conheça a Energy" onKeyDown={(event) => { if (event.key === "ArrowLeft") go(active - 1); if (event.key === "ArrowRight") go(active + 1); }} tabIndex={0}><div className="carousel-image"><Image key={slide.src} src={slide.src} alt={slide.alt} fill priority={active === 0} sizes="(max-width: 800px) 100vw, 66vw" /></div><div className="carousel-copy" aria-live="polite"><span>{slide.eyebrow}</span><h3>{slide.title}</h3><p>{slide.text}</p><div className="carousel-meta"><strong>{String(active + 1).padStart(2, "0")}</strong><span>/ {String(slides.length).padStart(2, "0")}</span></div></div><div className="carousel-controls"><button type="button" onClick={() => go(active - 1)} aria-label="Imagem anterior"><ChevronLeft /></button><button type="button" onClick={() => go(active + 1)} aria-label="Próxima imagem"><ChevronRight /></button></div><div className="carousel-dots" aria-label="Selecionar imagem">{slides.map((item, index) => <button key={item.src} type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Mostrar imagem ${index + 1}: ${item.eyebrow}`} aria-current={index === active ? "true" : undefined} />)}</div></div></Container></section>;
}
