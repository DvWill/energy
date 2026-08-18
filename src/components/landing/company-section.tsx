"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { Container } from "@/components/ui/container";
import { withBasePath } from "@/lib/base-path";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  microTransition,
  revealVariants,
  sectionTransition,
  viewportOnce,
} from "@/lib/motion";
import {
  EyebrowReveal,
  LineReveal,
  TextReveal,
} from "@/components/motion/motion-primitives";

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

function relativePosition(index: number, active: number) {
  let position = index - active;
  const midpoint = Math.floor(slides.length / 2);
  if (position > midpoint) position -= slides.length;
  if (position < -midpoint) position += slides.length;
  return position;
}

export function CompanySection() {
  const [active, setActive] = useState(1);
  const reduced = useAccessibleMotion();

  const paginate = (delta: number) => {
    setActive((current) => (current + delta + slides.length) % slides.length);
  };

  const finishDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const intent = info.offset.x + info.velocity.x * 0.14;
    if (intent < -65) paginate(1);
    if (intent > 65) paginate(-1);
  };

  return (
    <section
      id="quem-somos"
      className="section company-section company-editorial"
      aria-labelledby="company-title"
    >
      <Container>
        <motion.div
          className="company-lead company-editorial-lead"
          data-motion-reveal=""
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={reduced ? undefined : revealVariants}
          transition={reduced ? { duration: 0 } : sectionTransition}
        >
          <div>
            <EyebrowReveal className="eyebrow dark">
              POR DENTRO DA ENERGY
            </EyebrowReveal>
            <TextReveal
              id="company-title"
              lines={[
                {
                  content: (
                    <>
                      Histórias,{" "}
                      <span className="text-keyword-blue">
                        tecnologia e pessoas
                      </span>{" "}
                      que movem nossos projetos.
                    </>
                  ),
                },
              ]}
            />
            <LineReveal />
          </div>
          <p>
            Conheça nossa estrutura, nosso atendimento e as soluções por
            trás de cada projeto.
          </p>
        </motion.div>

        <motion.div
          className="company-center-carousel"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Por dentro da Energy"
          aria-describedby="company-carousel-instructions"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              paginate(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              paginate(1);
            }
          }}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={reduced ? undefined : revealVariants}
          transition={reduced ? { duration: 0 } : sectionTransition}
        >
          <span className="sr-only" id="company-carousel-instructions">
            Use as setas do teclado, os botões ou arraste para navegar pelos
            cinco conteúdos.
          </span>

          <motion.div
            className="company-carousel-stage"
            drag={reduced ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={finishDrag}
            style={{ touchAction: "pan-y" }}
          >
            {slides.map((slide, index) => {
              const position = relativePosition(index, active);
              const isActive = position === 0;
              const isAdjacent = Math.abs(position) === 1;
              const offset = position * 92;

              return (
                <motion.button
                  type="button"
                  className="company-story-card"
                  data-active={isActive ? "true" : "false"}
                  data-adjacent={isAdjacent ? "true" : "false"}
                  key={slide.src}
                  aria-label={`${slide.eyebrow}: ${slide.title}${isActive ? ", conteúdo atual" : ", mostrar conteúdo"}`}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isActive || isAdjacent ? 0 : -1}
                  onClick={() => setActive(index)}
                  animate={{
                    x: `${offset}%`,
                    scale: isActive ? 1.06 : isAdjacent ? 0.9 : 0.78,
                    opacity: isActive ? 1 : isAdjacent ? 0.9 : 0.48,
                    zIndex: isActive ? 5 : isAdjacent ? 3 : 1,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <Image
                    src={withBasePath(slide.src)}
                    alt={slide.alt}
                    draggable={false}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 600px) 86vw, (max-width: 1000px) 70vw, 62vw"
                  />
                  <span className="company-story-shade" aria-hidden="true" />
                  <span className="company-story-copy">
                    <span className="company-story-eyebrow">
                      {slide.eyebrow}
                    </span>
                    <strong>{slide.title}</strong>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.button
            type="button"
            className="company-carousel-arrow company-carousel-arrow-prev"
            onClick={() => paginate(-1)}
            aria-label="História anterior"
            whileHover={reduced ? undefined : { scale: 1.06 }}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            transition={microTransition}
          >
            <ChevronLeft aria-hidden="true" />
          </motion.button>
          <motion.button
            type="button"
            className="company-carousel-arrow company-carousel-arrow-next"
            onClick={() => paginate(1)}
            aria-label="Próxima história"
            whileHover={reduced ? undefined : { scale: 1.06 }}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            transition={microTransition}
          >
            <ChevronRight aria-hidden="true" />
          </motion.button>

          <div className="company-carousel-status" aria-live="polite">
            <span className="company-carousel-count">
              <strong>{String(active + 1).padStart(2, "0")}</strong>
              <span>/ {String(slides.length).padStart(2, "0")}</span>
            </span>
            <span className="company-carousel-segments" aria-hidden="true">
              {slides.map((slide, index) => (
                <span
                  key={slide.src}
                  className={index === active ? "active" : ""}
                />
              ))}
            </span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
