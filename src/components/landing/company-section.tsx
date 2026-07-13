"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { withBasePath } from "@/lib/base-path";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  elementTransition,
  microTransition,
  revealVariants,
  viewportOnce,
} from "@/lib/motion";

const slides = [
  {
    src: "/images/company/equipe-energy.webp",
    alt: "Equipe Energy na recepção da empresa",
    eyebrow: "QUEM SOMOS",
    title: "Estrutura real. Contato humano.",
    text: "Um ambiente preparado para receber demandas, desenvolver projetos e aproximar pessoas das decisões sobre energia.",
  },
  {
    src: "/images/company/planejamento.webp",
    alt: "Ambiente de planejamento da Energy",
    eyebrow: "PLANEJAMENTO",
    title: "Cada projeto começa com contexto.",
    text: "Organização e análise para transformar necessidades em próximos passos claros.",
  },
  {
    src: "/images/company/conhecimento-tecnico.webp",
    alt: "Profissional da Energy apresentando um inversor solar",
    eyebrow: "CONHECIMENTO TÉCNICO",
    title: "Tecnologia explicada com clareza.",
    text: "A proximidade entre pessoas e equipamentos faz parte de uma decisão mais bem orientada.",
  },
  {
    src: "/images/company/novas-tecnologias.webp",
    alt: "Carregador elétrico de parede em demonstração",
    eyebrow: "NOVAS TECNOLOGIAS",
    title: "Energia em constante evolução.",
    text: "Acompanhamos tecnologias que ampliam as possibilidades de uso inteligente da energia.",
  },
  {
    src: "/images/company/atendimento-proximo.webp",
    alt: "Profissional de atendimento com a identidade da Energy",
    eyebrow: "ATENDIMENTO",
    title: "Uma conversa próxima desde o início.",
    text: "Pessoas preparadas para ouvir, organizar informações e conectar você à equipe certa.",
  },
] as const;

export function CompanySection() {
  const [active, setActive] = useState(0);
  const go = (next: number) =>
    setActive((next + slides.length) % slides.length);
  const slide = slides[active];
  const reduced = useAccessibleMotion();
  return (
    <section
      id="quem-somos"
      className="section company-section"
      aria-labelledby="company-title"
    >
      <Container>
        <motion.div
          className="company-lead"
          data-motion-reveal=""
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealVariants}
        >
          <div>
            <span className="eyebrow dark">CONHEÇA A ENERGY</span>
            <h2 id="company-title">Quem somos?</h2>
            <h3>
              Pessoas e técnica para transformar boas escolhas em projetos de
              energia.
            </h3>
          </div>
          <p>
            Uma equipe próxima, preparada para entender cada contexto e
            organizar os próximos passos com clareza.
          </p>
        </motion.div>
        <motion.div
          className="company-carousel"
          data-motion-reveal=""
          role="region"
          aria-roledescription="carrossel"
          aria-label="Conheça a Energy"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") go(active - 1);
            if (event.key === "ArrowRight") go(active + 1);
          }}
          tabIndex={0}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealVariants}
        >
          <motion.div
            className="carousel-image"
            key={`image-${slide.src}`}
            initial={reduced ? false : { opacity: 0.55, scale: 1.012 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : elementTransition}
          >
            <Image
              src={withBasePath(slide.src)}
              alt={slide.alt}
              fill
              priority={active === 0}
              sizes="(max-width: 800px) 100vw, 66vw"
            />
          </motion.div>
          <motion.div
            className="carousel-copy"
            key={`copy-${slide.src}`}
            aria-live="polite"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : elementTransition}
          >
            <span>{slide.eyebrow}</span>
            <h3>{slide.title}</h3>
            <p>{slide.text}</p>
            <div className="carousel-meta">
              <strong>{String(active + 1).padStart(2, "0")}</strong>
              <span>/ {String(slides.length).padStart(2, "0")}</span>
            </div>
          </motion.div>
          <div className="carousel-controls">
            <motion.button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Imagem anterior"
              whileHover={reduced ? undefined : { scale: 1.055 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={microTransition}
            >
              <ChevronLeft aria-hidden="true" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Próxima imagem"
              whileHover={reduced ? undefined : { scale: 1.055 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={microTransition}
            >
              <ChevronRight aria-hidden="true" />
            </motion.button>
          </div>
          <div className="carousel-dots" aria-label="Selecionar imagem">
            {slides.map((item, index) => (
              <motion.button
                key={item.src}
                type="button"
                className={index === active ? "active" : ""}
                onClick={() => setActive(index)}
                aria-label={`Mostrar imagem ${index + 1}: ${item.eyebrow}`}
                aria-current={index === active ? "true" : undefined}
                whileHover={reduced ? undefined : { scale: 1.15 }}
                transition={microTransition}
              />
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
