"use client";
import { useState, useSyncExternalStore } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { siteContent as c } from "@/content/landing-page";
import { Container } from "@/components/ui/container";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  accordionVariants,
  instantAccordionVariants,
  microTransition,
  springTransition,
} from "@/lib/motion";

const subscribeToHydration = () => () => {};

export function FaqSection() {
  const [active, setActive] = useState<number | null>(0);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const reduced = useAccessibleMotion();
  return (
    <section
      id="faq"
      className="section faq-location-section"
      aria-labelledby="faq-title"
    >
      <Container className="faq-location-grid">
        <div className="faq-location-copy">
          <div className="faq-location-heading motion-heading">
            <span className="faq-location-badge">
              <MapPin aria-hidden="true" />
              <span>{c.faqSection.eyebrow}</span>
            </span>
            <h2 id="faq-title">{c.faqSection.title}</h2>
            <span className="line-reveal" aria-hidden="true" />
          </div>
          <div className="faq faq-location-list">
            {c.faq.map((item, i) => {
              const open = active === i;
              return (
                <div
                  className="faq-item"
                  data-state={open ? "open" : "closed"}
                  key={item.q}
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
                        animate={{
                          rotate: open ? 180 : 0,
                          scale: open ? 1.04 : 1,
                        }}
                        transition={
                          reduced ? { duration: 0 } : springTransition
                        }
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
                </div>
              );
            })}
          </div>
        </div>
        <div className="faq-location-map-shell">
          <iframe
            className="faq-location-map"
            src={c.contact.map.embedUrl}
            title={c.contact.map.title}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </section>
  );
}
