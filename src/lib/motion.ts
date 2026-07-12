import type { Transition, Variants } from "motion/react";

type CubicBezier = [number, number, number, number];

export const motionEase = {
  standard: [0.22, 1, 0.36, 1] as CubicBezier,
  emphasized: [0.16, 1, 0.3, 1] as CubicBezier,
  overshoot: [0.34, 1.18, 0.64, 1] as CubicBezier,
};

export const motionDuration = {
  micro: 0.2,
  element: 0.42,
  section: 0.68,
};

export const viewportOnce = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -8% 0px",
} as const;

export const microTransition: Transition = {
  duration: motionDuration.micro,
  ease: motionEase.overshoot,
};

export const elementTransition: Transition = {
  duration: motionDuration.element,
  ease: motionEase.standard,
};

export const sectionTransition: Transition = {
  duration: motionDuration.section,
  ease: motionEase.emphasized,
};

export const revealVariants: Variants = {
  hidden: { opacity: 0.8, y: 22 },
  visible: { opacity: 1, y: 0, transition: sectionTransition },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0.72, y: 18 },
  visible: { opacity: 1, y: 0, transition: sectionTransition },
};

export const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.09,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0.72, y: 20 },
  visible: { opacity: 1, y: 0, transition: sectionTransition },
};

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: motionDuration.element, ease: motionEase.standard },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: motionDuration.element,
      ease: motionEase.emphasized,
    },
  },
};

export const instantAccordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0 } },
  open: { height: "auto", opacity: 1, transition: { duration: 0 } },
};

export const menuVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: motionEase.standard },
  },
  open: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.element,
      ease: motionEase.emphasized,
    },
  },
};
