"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";
import { withBasePath } from "@/lib/base-path";
import { openLeadChat } from "@/lib/chat-events";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";

const number = (index: number) => String(index + 1).padStart(2, "0");

export function SolutionsSection() {
  const reduced = useAccessibleMotion();

  return (
    <section id="solucoes" className="solutions-section solutions-immersive">
      <Container>
        <header className="solutions-immersive-intro">
          <div>
            <span>ONDE A ENERGY ATUA</span>
            <h2>Soluções solares para diferentes necessidades.</h2>
            <i aria-hidden="true" />
          </div>
          <p>
            Da análise inicial ao cuidado com o sistema, cada etapa começa pelo
            entendimento do seu contexto.
          </p>
        </header>

        <div className="solutions-immersive-list">
          {c.solutions.map((item, index) => {
            return (
              <article
                id={`solucao-${number(index)}`}
                className="solution-panel"
                data-index={index}
                data-reverse={index % 2 ? "true" : "false"}
                key={item.title}
                aria-labelledby={`solution-title-${index}`}
              >
                <motion.div
                  className="solution-panel-copy"
                  initial={reduced ? false : { opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: reduced ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="solution-panel-ghost" aria-hidden="true">
                    {number(index)}
                  </span>
                  <span className="solution-panel-eyebrow">
                    {number(index)} / {item.eyebrow}
                  </span>
                  <h3 id={`solution-title-${index}`}>{item.title}</h3>
                  <p>{item.text}</p>
                  <button type="button" className="solution-panel-cta" onClick={openLeadChat}>
                    Conversar sobre esta solução
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                  <span className="solution-panel-line" aria-hidden="true" />
                </motion.div>

                <motion.div
                  className="solution-panel-media"
                  initial={
                    reduced
                      ? false
                      : { opacity: 0, x: index % 2 === 0 ? 120 : -120 }
                  }
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reduced ? 0 : 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <span className="solution-panel-media-layer" aria-hidden="true" />
                  <Image
                    src={withBasePath(item.image)}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 760px) 100vw, 58vw"
                  />
                </motion.div>

              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
