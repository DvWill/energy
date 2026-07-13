"use client";

import Image from "next/image";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { withBasePath } from "@/lib/base-path";
import { siteContent as c } from "@/content/landing-page";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  heroContainerVariants,
  heroItemVariants,
  microTransition,
  motionDuration,
  motionEase,
} from "@/lib/motion";

export function HeroSection({ primaryCta }: { primaryCta: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useAccessibleMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const layerNear = useTransform(scrollYProgress, [0, 1], [0, 26]);
  const layerFar = useTransform(scrollYProgress, [0, 1], [0, 12]);

  return (
    <motion.section ref={ref} id="inicio" className="hero hero-image">
      <div className="hero-logo-stage">
        <motion.div
          className="hero-logo-ghost"
          aria-hidden="true"
          style={reduced ? undefined : { y: layerFar }}
          animate={reduced ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
          transition={{
            duration: 20,
            ease: motionEase.standard,
            repeat: Infinity,
          }}
        >
          <Image
            src={withBasePath("/brand/energy-symbol-orange.png")}
            alt=""
            width={639}
            height={644}
            loading="eager"
          />
        </motion.div>
        <motion.div
          className="hero-logo-focus"
          style={reduced ? undefined : { y: layerNear }}
        >
          <Image
            src={withBasePath("/brand/energy-symbol-orange.png")}
            alt="Símbolo Energy"
            width={639}
            height={644}
            priority
            loading="eager"
            sizes="(max-width: 850px) 42vw, 24vw"
          />
        </motion.div>
      </div>
      <motion.div
        className="hero-message container"
        data-motion-hero=""
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={heroContainerVariants}
      >
        <motion.span
          className="eyebrow"
          data-motion-reveal=""
          variants={heroItemVariants}
        >
          {c.hero.eyebrow}
        </motion.span>
        <motion.h1 data-motion-reveal="" variants={heroItemVariants}>
          <span>{c.hero.titleStart}</span> <span>{c.hero.titleMiddle}</span>{" "}
          <em>{c.hero.titleAccent}</em>
        </motion.h1>
        <motion.p data-motion-reveal="" variants={heroItemVariants}>
          {c.hero.description}
        </motion.p>
        <motion.div
          className="actions"
          data-motion-reveal=""
          variants={heroItemVariants}
        >
          <motion.a
            className="button"
            href="#contato"
            whileHover={reduced ? undefined : { scale: 1.025, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.985 }}
            transition={microTransition}
          >
            {primaryCta}
            <ArrowRight aria-hidden="true" />
          </motion.a>
          <motion.a
            className="hero-link"
            href="#solucoes"
            whileHover={reduced ? undefined : { x: 3 }}
            transition={microTransition}
          >
            Conhecer soluções
          </motion.a>
        </motion.div>
        <motion.small data-motion-reveal="" variants={heroItemVariants}>
          <Check aria-hidden="true" /> {c.hero.trust}
        </motion.small>
      </motion.div>
      <motion.a
        className="scroll-indicator"
        data-motion-reveal=""
        href="#solucao"
        aria-label="Ir para a próxima seção"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: motionDuration.element,
          delay: reduced ? 0 : 0.72,
          ease: motionEase.standard,
        }}
      >
        <span>Continue</span>
        <ChevronDown aria-hidden="true" />
      </motion.a>
    </motion.section>
  );
}
