"use client";

import { Children, type ComponentProps, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  microTransition,
  revealVariants,
  sectionTransition,
  staggerContainerVariants,
  staggerItemVariants,
  viewportOnce,
} from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduced = useAccessibleMotion();
  return (
    <motion.div
      className={className}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={revealVariants}
      transition={{ ...sectionTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealArticle({
  children,
  className,
  ...props
}: ComponentProps<typeof motion.article>) {
  const reduced = useAccessibleMotion();
  return (
    <motion.article
      {...props}
      className={className}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={revealVariants}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={microTransition}
    >
      {children}
    </motion.article>
  );
}

export function StaggerGrid({
  children,
  className,
  interactive = false,
}: RevealProps & { interactive?: boolean }) {
  const reduced = useAccessibleMotion();
  return (
    <motion.div
      className={className}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? undefined : staggerContainerVariants}
    >
      {Children.toArray(children).map((child, index) => (
        <motion.div
          className="motion-grid-item"
          data-motion-reveal=""
          key={index}
          variants={reduced ? undefined : staggerItemVariants}
          whileHover={interactive && !reduced ? { y: -6 } : undefined}
          transition={microTransition}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function StaggerList({ children, className }: RevealProps) {
  const reduced = useAccessibleMotion();
  return (
    <motion.ol
      className={className}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? undefined : staggerContainerVariants}
    >
      {Children.toArray(children).map((child, index) => (
        <motion.li
          data-motion-reveal=""
          key={index}
          variants={reduced ? undefined : staggerItemVariants}
        >
          {child}
        </motion.li>
      ))}
    </motion.ol>
  );
}

export function MotionLink({
  children,
  ...props
}: ComponentProps<typeof motion.a>) {
  const reduced = useAccessibleMotion();
  return (
    <motion.a
      {...props}
      whileHover={reduced ? undefined : { scale: 1.025, y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={microTransition}
    >
      {children}
    </motion.a>
  );
}

export function DiagonalDivider() {
  const reduced = useAccessibleMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  return (
    <motion.div
      aria-hidden="true"
      className="diagonal-divider"
      style={reduced ? undefined : { y }}
    />
  );
}
