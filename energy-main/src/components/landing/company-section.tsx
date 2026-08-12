"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Container } from "@/components/ui/container";
import { withBasePath } from "@/lib/base-path";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  carouselVariants,
  microTransition,
  progressVariants,
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

export function CompanySection() {
  const [[active, direction], setSlide] = useState([0, 1]);
  const reduced = useAccessibleMotion();
  const slide = slides[active];

  const paginate = (delta: number) => {
    setSlide(([current]) => [
      (current + delta + slides.length) % slides.length,
      delta > 0 ? 1 : -1,
    ]);
  };

  const select = (index: number) => {
    if (index === active) return;
    setSlide([index, index > active ? 1 : -1]);
  };

  const finishDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const intent = info.offset.x + info.velocity.x * 0.16;
    if (intent < -70) paginate(1);
    if (intent > 70) paginate(-1);
  };

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
          variants={reduced ? undefined : revealVariants}
          transition={reduced ? { duration: 0 } : sectionTransition}
        >
          <div>
            <EyebrowReveal className="eyebrow dark">CONHEÇA A ENERGY</EyebrowReveal>
            <TextReveal
              id="company-title"
              lines={[{ content: "Quem somos?" }]}
            />
            <h3>
              Pessoas e técnica para transformar boas escolhas em projetos de
              energia.
            </h3>
            <LineReveal />
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
          aria-describedby="company-carousel-instructions"
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
          tabIndex={0}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={reduced ? undefined : revealVariants}
          transition={reduced ? { duration: 0 } : sectionTransition}
        >
          <span className="sr-only" id="company-carousel-instructions">
            Use as setas, os botões ou arraste a imagem para trocar o conteúdo.
          </span>

          <div className="carousel-image">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                className="carousel-image-slide"
                custom={direction}
                key={slide.src}
                variants={reduced ? undefined : carouselVariants}
                initial={reduced ? false : "enter"}
                animate="center"
                exit={reduced ? undefined : "exit"}
                drag={reduced ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragDirectionLock
                dragElastic={0.12}
                dragMomentum={false}
                onDragEnd={finishDrag}
                style={{ touchAction: "pan-y" }}
                data-motion-carousel=""
              >
                <Image
                  src={withBasePath(slide.src)}
                  alt={slide.alt}
                  draggable={false}
                  fill
                  priority={active === 0}
                  sizes="(max-width: 800px) 100vw, 66vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="carousel-copy" aria-live="polite" aria-atomic="true">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                className="carousel-copy-slide"
                custom={direction}
                key={`copy-${slide.src}`}
                variants={reduced ? undefined : carouselVariants}
                initial={reduced ? false : "enter"}
                animate="center"
                exit={reduced ? undefined : "exit"}
              >
                <span>{slide.eyebrow}</span>
                <h3>{slide.title}</h3>
                <p>{slide.text}</p>
                <div className="carousel-meta">
                  <strong>{String(active + 1).padStart(2, "0")}</strong>
                  <span>/ {String(slides.length).padStart(2, "0")}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="carousel-progress" aria-hidden="true">
            <motion.span
              initial={false}
              animate={{ scaleX: (active + 1) / slides.length }}
              variants={reduced ? undefined : progressVariants}
              transition={reduced ? { duration: 0 } : sectionTransition}
            />
          </div>

          <div className="carousel-controls">
            <motion.button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Imagem anterior"
              whileHover={reduced ? undefined : { scale: 1.055 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={microTransition}
            >
              <ChevronLeft aria-hidden="true" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => paginate(1)}
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
                onClick={() => select(index)}
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
