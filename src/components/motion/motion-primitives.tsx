"use client";

import {
  Children,
  type ComponentProps,
  type PointerEvent,
  type ReactNode,
  useRef,
} from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import {
  accentLineVariants,
  alternatingItemVariants,
  directionalRevealVariants,
  eyebrowVariants,
  iconVariants,
  imageCurtainVariants,
  imageInnerVariants,
  imageRevealVariants,
  microTransition,
  motionParallax,
  numberVariants,
  progressVariants,
  revealVariants,
  sectionTransition,
  staggerContainerVariants,
  staggerItemVariants,
  textContainerVariants,
  textLineVariants,
  viewportImage,
  viewportOnce,
  type RevealDirection,
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
      variants={reduced ? undefined : revealVariants}
      transition={
        reduced ? { duration: 0 } : { ...sectionTransition, delay }
      }
    >
      {children}
    </motion.div>
  );
}

type RevealArticleProps = ComponentProps<typeof motion.article> & {
  direction?: RevealDirection;
};

export function RevealArticle({
  children,
  className,
  direction = "up",
  ...props
}: RevealArticleProps) {
  const reduced = useAccessibleMotion();
  return (
    <motion.article
      {...props}
      className={className}
      custom={direction}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? undefined : directionalRevealVariants}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={reduced ? { duration: 0 } : sectionTransition}
    >
      {children}
    </motion.article>
  );
}

type StaggerGridProps = RevealProps & {
  interactive?: boolean;
  alternate?: boolean;
  spotlight?: boolean;
};

export function StaggerGrid({
  children,
  className,
  interactive = false,
  alternate = false,
  spotlight = false,
}: StaggerGridProps) {
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const spotlightEnabled = spotlight && finePointer && !reduced;

  const moveSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    if (!spotlightEnabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spotlight-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spotlight-y",
      `${event.clientY - bounds.top}px`,
    );
    event.currentTarget.style.setProperty("--spotlight-opacity", "1");
  };

  const hideSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--spotlight-opacity", "0");
  };

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
          custom={index}
          data-cursor-glow={spotlightEnabled ? "enabled" : "disabled"}
          data-motion-reveal=""
          key={index}
          onPointerLeave={hideSpotlight}
          onPointerMove={moveSpotlight}
          variants={
            reduced
              ? undefined
              : alternate
                ? alternatingItemVariants
                : staggerItemVariants
          }
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
    <motion.div
      className="motion-list-shell"
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? undefined : staggerContainerVariants}
    >
      <span className="process-progress-track" aria-hidden="true">
        <motion.span
          className="process-progress-fill"
          variants={reduced ? undefined : progressVariants}
        />
      </span>
      <ol className={className}>
        {Children.toArray(children).map((child, index) => (
          <motion.li
            custom={index}
            data-motion-reveal=""
            key={index}
            variants={reduced ? undefined : staggerItemVariants}
          >
            {child}
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

export function MotionLink({
  children,
  className,
  ...props
}: ComponentProps<typeof motion.a>) {
  const reduced = useAccessibleMotion();
  return (
    <motion.a
      {...props}
      className={`motion-link${className ? ` ${className}` : ""}`}
      whileHover={reduced ? undefined : { scale: 1.018, y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={microTransition}
    >
      {children}
    </motion.a>
  );
}

type TextLine = {
  content: ReactNode;
  accent?: boolean;
};

type TextRevealProps = {
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
  immediate?: boolean;
  lines: TextLine[];
};

export function TextReveal({
  as = "h2",
  className,
  id,
  immediate = false,
  lines,
}: TextRevealProps) {
  const reduced = useAccessibleMotion();
  const Tag = as === "h1" ? motion.h1 : as === "h3" ? motion.h3 : motion.h2;

  return (
    <Tag
      className={className}
      data-motion-text=""
      id={id}
      initial={reduced ? false : "hidden"}
      animate={immediate ? "visible" : undefined}
      whileInView={immediate ? undefined : "visible"}
      viewport={immediate ? undefined : viewportOnce}
      variants={reduced ? undefined : textContainerVariants}
    >
      {lines.map((line, index) => (
        <span className="text-reveal-mask" key={index}>
          <motion.span
            className={line.accent ? "text-reveal-line is-accent" : "text-reveal-line"}
            variants={
              reduced
                ? undefined
                : line.accent
                  ? accentLineVariants
                  : textLineVariants
            }
          >
            {line.content}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function EyebrowReveal({
  children,
  className,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  const reduced = useAccessibleMotion();
  return (
    <motion.span
      className={className}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      animate={immediate ? "visible" : undefined}
      whileInView={immediate ? undefined : "visible"}
      viewport={immediate ? undefined : viewportOnce}
      variants={reduced ? undefined : eyebrowVariants}
    >
      {children}
    </motion.span>
  );
}

export function LineReveal({ className }: { className?: string }) {
  const reduced = useAccessibleMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`line-reveal${className ? ` ${className}` : ""}`}
      data-motion-decorative=""
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={viewportOnce}
      transition={reduced ? { duration: 0 } : sectionTransition}
    />
  );
}

export function ImageReveal({ children, className }: RevealProps) {
  const reduced = useAccessibleMotion();
  return (
    <motion.div
      className={`motion-image-reveal${className ? ` ${className}` : ""}`}
      data-motion-image=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportImage}
      variants={reduced ? undefined : imageRevealVariants}
    >
      <motion.div
        className="motion-image-reveal-inner"
        variants={reduced ? undefined : imageInnerVariants}
      >
        {children}
      </motion.div>
      <motion.span
        aria-hidden="true"
        className="motion-image-curtain"
        variants={reduced ? undefined : imageCurtainVariants}
      />
    </motion.div>
  );
}

export function ParallaxImage({
  children,
  className,
  distance = motionParallax.image,
}: RevealProps & { distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useAccessibleMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <div
      className={`motion-parallax-image${className ? ` ${className}` : ""}`}
      ref={ref}
    >
      <motion.div
        className="motion-parallax-image-inner"
        data-motion-parallax={reduced ? "disabled" : "enabled"}
        style={reduced ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  );
}

type MagneticButtonProps = ComponentProps<typeof motion.a> & {
  intensity?: number;
};

export function MagneticButton({
  children,
  className,
  intensity = 0.13,
  onPointerLeave,
  onPointerMove,
  style,
  ...props
}: MagneticButtonProps) {
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 22, mass: 0.55 });
  const y = useSpring(rawY, { stiffness: 260, damping: 22, mass: 0.55 });
  const enabled = finePointer && !reduced;

  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    onPointerMove?.(event);
    if (!enabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - bounds.left - bounds.width / 2) * intensity);
    rawY.set((event.clientY - bounds.top - bounds.height / 2) * intensity);
  };

  const leave = (event: PointerEvent<HTMLAnchorElement>) => {
    onPointerLeave?.(event);
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.a
      {...props}
      className={`magnetic-button${className ? ` ${className}` : ""}`}
      data-magnetic-enabled={enabled ? "true" : "false"}
      onPointerLeave={leave}
      onPointerMove={move}
      style={enabled ? { ...style, x, y } : style}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={microTransition}
    >
      {children}
    </motion.a>
  );
}

export function AnimatedIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useAccessibleMotion();
  return (
    <motion.span
      className={`animated-icon${className ? ` ${className}` : ""}`}
      data-motion-reveal=""
      variants={reduced ? undefined : iconVariants}
      whileHover={reduced ? undefined : { rotate: 5, scale: 1.06 }}
      transition={microTransition}
    >
      {children}
    </motion.span>
  );
}

export function NumberReveal({ children }: { children: ReactNode }) {
  const reduced = useAccessibleMotion();
  return (
    <motion.span
      className="number"
      data-motion-reveal=""
      variants={reduced ? undefined : numberVariants}
    >
      {children}
    </motion.span>
  );
}

type MotionRow = { key: string; cells: [ReactNode, ReactNode, ReactNode] };

export function StaggerRows({
  headers,
  label,
  rows,
}: {
  headers: [ReactNode, ReactNode, ReactNode];
  label: string;
  rows: MotionRow[];
}) {
  const reduced = useAccessibleMotion();
  return (
    <motion.div
      className="comparison"
      role="table"
      aria-label={label}
      data-motion-reveal=""
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={reduced ? undefined : staggerContainerVariants}
    >
      <div className="compare-row compare-head" role="row">
        {headers.map((header, index) => (
          <span role="columnheader" key={index}>
            {header}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <motion.div
          className="compare-row"
          role="row"
          key={row.key}
          variants={reduced ? undefined : staggerItemVariants}
        >
          <strong role="rowheader">{row.cells[0]}</strong>
          <span role="cell" data-label={typeof headers[1] === "string" ? headers[1] : undefined}>{row.cells[1]}</span>
          <span role="cell" data-label={typeof headers[2] === "string" ? headers[2] : undefined}>{row.cells[2]}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ScrollProgress() {
  const reduced = useAccessibleMotion();
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="site-scroll-progress"
      data-motion-progress={reduced ? "disabled" : "enabled"}
      style={reduced ? undefined : { scaleX: scrollYProgress }}
    />
  );
}

export function DiagonalDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useAccessibleMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  return (
    <motion.div
      aria-hidden="true"
      className="diagonal-divider"
      data-motion-parallax={reduced ? "disabled" : "enabled"}
      ref={ref}
      style={reduced ? undefined : { y }}
    />
  );
}
