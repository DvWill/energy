"use client";

import Image from "next/image";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useInView,
} from "motion/react";
import { type PointerEvent, useRef } from "react";
import { HeroLogo3D } from "@/components/landing/hero-logo-3d";
import {
  EyebrowReveal,
  MagneticButton,
  MotionLink,
  TextReveal,
} from "@/components/motion/motion-primitives";
import { siteContent as c } from "@/content/landing-page";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import {
  heroContainerVariants,
  heroItemVariants,
  motionDuration,
  motionEase,
  motionParallax,
} from "@/lib/motion";
import { withBasePath } from "@/lib/base-path";

export function HeroSection({ primaryCta }: { primaryCta: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useAccessibleMotion();
  const heroInView = useInView(ref, { amount: 0.05 });
  const finePointer = useFinePointer();
  const cursorEnabled = finePointer && !reduced;
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  });
  const smoothY = useSpring(cursorY, {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  });
  const tiltX = useTransform(
    smoothY,
    [-motionParallax.cursor, motionParallax.cursor],
    [2.2, -2.2],
  );
  const tiltY = useTransform(
    smoothX,
    [-motionParallax.cursor, motionParallax.cursor],
    [-2.8, 2.8],
  );
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const layerFar = useTransform(
    scrollYProgress,
    [0, 1],
    [0, motionParallax.heroFar],
  );
  const layerNear = useTransform(
    scrollYProgress,
    [0, 1],
    [0, motionParallax.heroNear],
  );

  const moveHero = (event: PointerEvent<HTMLElement>) => {
    if (!cursorEnabled || event.pointerType !== "mouse") return;
    if (
      event.target instanceof Element &&
      event.target.closest(".hero-logo-model-shell")
    ) {
      cursorX.set(0);
      cursorY.set(0);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    cursorX.set(horizontal * motionParallax.cursor);
    cursorY.set(vertical * motionParallax.cursor);
  };

  const resetHero = () => {
    cursorX.set(0);
    cursorY.set(0);
  };

  return (
    <motion.section
      ref={ref}
      id="inicio"
      className="hero hero-image"
      data-cursor-motion={cursorEnabled ? "enabled" : "disabled"}
      data-hero-visible={heroInView ? "true" : "false"}
      onPointerLeave={resetHero}
      onPointerMove={moveHero}
    >
      <Image
        className="hero-background"
        src={withBasePath("/images/hero-solar-plant.webp")}
        alt=""
        fill
        priority
        sizes="(max-width: 680px) 160vh, (max-width: 900px) 150vh, 100vw"
      />
      <div className="hero-overlay" aria-hidden="true" />

      <motion.div
        aria-hidden="true"
        className="hero-ambient-layer"
        data-motion-parallax={reduced ? "disabled" : "enabled"}
        style={reduced ? undefined : { y: layerFar }}
      >
        <span className="hero-ambient hero-ambient-one" />
        <span className="hero-ambient hero-ambient-two" />
        <span className="hero-energy-line hero-energy-line-one" />
        <span className="hero-energy-line hero-energy-line-two" />
      </motion.div>

      <div className="hero-logo-stage">
        <motion.div
          className="hero-logo-scroll-layer"
          data-motion-parallax={reduced ? "disabled" : "enabled"}
          style={reduced ? undefined : { y: layerNear }}
        >
          <motion.div
            className="hero-logo-model-motion"
            style={
              cursorEnabled
                ? {
                    x: smoothX,
                    y: smoothY,
                    rotateX: tiltX,
                    rotateY: tiltY,
                  }
                : undefined
            }
          >
            <HeroLogo3D />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="hero-message container"
        data-motion-hero=""
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={reduced ? undefined : heroContainerVariants}
      >
        <EyebrowReveal className="eyebrow" immediate>
          {c.hero.eyebrow}
        </EyebrowReveal>
        <TextReveal
          as="h1"
          immediate
          lines={[
            { content: c.hero.titleStart },
            { content: c.hero.titleMiddle },
            { content: c.hero.titleAccent, accent: true },
          ]}
        />
        <motion.p data-motion-reveal="" variants={heroItemVariants}>
          {c.hero.description}
        </motion.p>
        <motion.div
          className="actions"
          data-motion-reveal=""
          variants={heroItemVariants}
        >
          <MagneticButton
            className="button hero-primary-cta"
            href={c.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{primaryCta}</span>
            <ArrowRight aria-hidden="true" />
          </MagneticButton>
          <MotionLink className="hero-link" href="#solucoes">
            Conhecer soluções
          </MotionLink>
        </motion.div>
        <motion.small data-motion-reveal="" variants={heroItemVariants}>
          <Check aria-hidden="true" /> {c.hero.trust}
        </motion.small>
      </motion.div>

      <motion.a
        className="scroll-indicator"
        data-motion-reveal=""
        href="#calculadora"
        aria-label="Ir para a próxima seção"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: motionDuration.element,
          delay: reduced ? 0 : 0.78,
          ease: motionEase.standard,
        }}
      >
        <span>Continue</span>
        <motion.span
          className="scroll-indicator-icon"
          animate={reduced || !heroInView ? { y: 0 } : { y: [0, 6, 0] }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 1.8,
                  ease: motionEase.inOut,
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }
          }
        >
          <ChevronDown aria-hidden="true" />
        </motion.span>
      </motion.a>
    </motion.section>
  );
}
