import type { Transition, Variants } from "motion/react";

type CubicBezier = [number, number, number, number];

export type RevealDirection = "up" | "left" | "right";

export const motionEase = {
  standard: [0.22, 1, 0.36, 1] as CubicBezier,
  emphasized: [0.16, 1, 0.3, 1] as CubicBezier,
  overshoot: [0.34, 1.18, 0.64, 1] as CubicBezier,
  inOut: [0.65, 0, 0.35, 1] as CubicBezier,
};

export const motionDuration = {
  instant: 0,
  micro: 0.2,
  element: 0.42,
  section: 0.68,
  hero: 0.82,
};

export const motionDistance = {
  micro: 4,
  element: 18,
  section: 32,
  image: 44,
  hero: 54,
};

export const motionStagger = {
  tight: 0.055,
  standard: 0.085,
  relaxed: 0.12,
};

export const motionParallax = {
  image: 18,
  heroFar: 12,
  heroNear: 32,
  cursor: 10,
};

export const threeMotion = {
  rotationSeconds: 30,
  frameRate: 30,
  maxPixelRatio: 1.5,
  loadDelayMs: 80,
  dragSensitivity: 0.012,
  dragTiltSensitivity: 0.007,
  maxDragTilt: 0.48,
  keyboardRotationStep: Math.PI / 18,
};

export const viewportOnce = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -8% 0px",
} as const;

export const viewportImage = {
  once: true,
  amount: 0.24,
  margin: "0px 0px -6% 0px",
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

export const springTransition: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 24,
  mass: 0.7,
};

export const calculatorSelectionTransition: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 30,
  mass: 0.68,
};

export const calculatorAmbientTransition: Transition = {
  duration: 9,
  repeat: Infinity,
  ease: "easeInOut",
};

export const calculatorResultVariants: Variants = {
  hidden: {
    opacity: 0,
    y: motionDistance.element,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: sectionTransition,
  },
  exit: {
    opacity: 0,
    y: -motionDistance.micro,
    transition: microTransition,
  },
};

export const chatDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    y: motionDistance.element,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: motionDistance.micro,
    scale: 0.985,
    transition: microTransition,
  },
};

export const chatMessageVariants: Variants = {
  hidden: { opacity: 0, y: motionDistance.micro },
  visible: { opacity: 1, y: 0, transition: elementTransition },
  exit: { opacity: 0, y: -motionDistance.micro, transition: microTransition },
};

export const revealVariants: Variants = {
  hidden: { opacity: 0.01, y: motionDistance.section },
  visible: { opacity: 1, y: 0 },
};

export const directionalRevealVariants: Variants = {
  hidden: (direction: RevealDirection = "up") => ({
    opacity: 0.01,
    x:
      direction === "left"
        ? -motionDistance.section
        : direction === "right"
          ? motionDistance.section
          : 0,
    y: direction === "up" ? motionDistance.element : 0,
  }),
  visible: { opacity: 1, x: 0, y: 0 },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionStagger.standard,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0.01, y: motionDistance.element },
  visible: { opacity: 1, y: 0, transition: sectionTransition },
};

export const alternatingItemVariants: Variants = {
  hidden: (index: number = 0) => ({
    opacity: 0.01,
    x: index % 2 === 0 ? -motionDistance.section : motionDistance.section,
    y: motionDistance.micro,
  }),
  visible: { opacity: 1, x: 0, y: 0, transition: sectionTransition },
};

export const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: motionStagger.standard,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0.01, y: motionDistance.element },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.section,
      ease: motionEase.emphasized,
    },
  },
};

export const textContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: motionStagger.relaxed,
    },
  },
};

export const textLineVariants: Variants = {
  hidden: { opacity: 0.01, y: "112%", rotate: 1.2 },
  visible: {
    opacity: 1,
    y: "0%",
    rotate: 0,
    transition: {
      duration: motionDuration.hero,
      ease: motionEase.emphasized,
    },
  },
};

export const accentLineVariants: Variants = {
  hidden: { opacity: 0.01, y: "112%", scale: 0.96 },
  visible: {
    opacity: 1,
    y: "0%",
    scale: 1,
    transition: {
      duration: motionDuration.hero,
      delay: 0.08,
      ease: motionEase.emphasized,
    },
  },
};

export const eyebrowVariants: Variants = {
  hidden: { opacity: 0.01, y: 8, letterSpacing: "0.08em" },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: "0.16em",
    transition: sectionTransition,
  },
};

export const imageRevealVariants: Variants = {
  hidden: { opacity: 0.98 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionDuration.hero,
      ease: motionEase.emphasized,
    },
  },
};

export const imageCurtainVariants: Variants = {
  hidden: { scaleY: 1 },
  visible: {
    scaleY: 0,
    transition: {
      duration: motionDuration.hero,
      ease: motionEase.emphasized,
    },
  },
};

export const imageInnerVariants: Variants = {
  hidden: { scale: 1.07 },
  visible: {
    scale: 1,
    transition: {
      duration: 1,
      ease: motionEase.emphasized,
    },
  },
};

export const numberVariants: Variants = {
  hidden: { opacity: 0.01, scale: 0.72, rotate: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: springTransition,
  },
};

export const iconVariants: Variants = {
  hidden: { opacity: 0.01, scale: 0.72, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: springTransition,
  },
};

export const progressVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.1,
      ease: motionEase.emphasized,
      delay: 0.08,
    },
  },
};

export const carouselVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? motionDistance.image : -motionDistance.image,
    scale: 1.025,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: sectionTransition,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -motionDistance.element : motionDistance.element,
    scale: 0.99,
    transition: elementTransition,
  }),
};

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: motionEase.standard },
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
    opacity: 0,
    scaleY: 0.96,
    y: -8,
    transitionEnd: { visibility: "hidden" },
    transition: { duration: 0.24, ease: motionEase.standard },
  },
  open: {
    opacity: 1,
    scaleY: 1,
    y: 0,
    visibility: "visible",
    transition: {
      duration: motionDuration.element,
      ease: motionEase.emphasized,
    },
  },
};

export const instantMenuVariants: Variants = {
  closed: {
    opacity: 0,
    scaleY: 1,
    y: 0,
    visibility: "hidden",
    transition: { duration: 0 },
  },
  open: {
    opacity: 1,
    scaleY: 1,
    y: 0,
    visibility: "visible",
    transition: { duration: 0 },
  },
};
