"use client";
import { useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { siteContent as c } from "@/content/landing-page";
import { Container } from "@/components/ui/container";
import {
  accordionVariants,
  instantAccordionVariants,
  microTransition,
  revealVariants,
  staggerContainerVariants,
  staggerItemVariants,
  viewportOnce,
} from "@/lib/motion";

const subscribeToHydration = () => () => {};

export function FaqSection() {
  const [active, setActive] = useState<number | null>(0);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const reduced = useReducedMotion();
  return (
    <section id="faq" className="section">
      <Container>
        <motion.div
          className="section-heading"
          data-motion-reveal=""
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealVariants}
        >
          <span>PERGUNTAS FREQUENTES</span>
          <h2>Antes de iniciar a conversa.</h2>
        </motion.div>
        <motion.div
          className="faq"
          data-motion-reveal=""
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          variants={reduced ? undefined : staggerContainerVariants}
        >
          {c.faq.map((item, i) => {
            const open = active === i;
            return (
              <motion.div
                className="faq-item"
                data-motion-reveal=""
                key={item.q}
                variants={reduced ? undefined : staggerItemVariants}
              >
                <h3>
                  <motion.button
                    id={`faq-button-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setActive(open ? null : i)}
                    whileHover={reduced ? undefined : { x: 3 }}
                    transition={microTransition}
                  >
                    {item.q}
                    <motion.span
                      className="faq-icon"
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={reduced ? { duration: 0 } : microTransition}
                    >
                      <ChevronDown aria-hidden="true" />
                    </motion.span>
                  </motion.button>
                </h3>
                <motion.div
                  id={`faq-${i}`}
                  className="faq-answer"
                  data-motion-accordion=""
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  aria-hidden={hydrated ? !open : undefined}
                  initial={false}
                  animate={open ? "open" : "collapsed"}
                  variants={
                    reduced ? instantAccordionVariants : accordionVariants
                  }
                >
                  <div className="faq-answer-inner">
                    <p>{item.a}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
