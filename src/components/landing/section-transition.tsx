const transitionDepth = {
  "hero-calculator": "continuous",
  "calculator-problem": "soft",
  "problem-solutions": "soft",
  "solutions-benefits": "soft",
  "benefits-company": "continuous",
  "company-process": "deep",
  "process-differentiators": "deep",
  "differentiators-metrics": "continuous",
  "metrics-faq": "continuous",
  "faq-cta": "deep",
  "cta-contact": "deep",
  "contact-footer": "deep",
} as const;

type TransitionVariant = keyof typeof transitionDepth;
type TransitionAccent = "left" | "center" | "right";

export function SectionTransition({
  variant,
  accent = "center",
}: {
  variant: TransitionVariant;
  accent?: TransitionAccent;
}) {
  return (
    <div
      className={`section-transition section-transition--${variant}`}
      data-flow-transition={variant}
      data-flow-accent={accent}
      data-flow-depth={transitionDepth[variant]}
      data-motion-decorative=""
      aria-hidden="true"
    >
      <span
        className="section-transition__solar-field"
        data-flow-decoration="solar-field"
      />
      <span
        className="section-transition__light-beam"
        data-flow-decoration="light-beam"
      />
      <svg
        className="section-transition__traces"
        data-flow-decoration="traces"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="section-transition__trace section-transition__trace--blue"
          d="M-72 116C164 28 364 142 642 84C914 27 1134 24 1512 108"
          pathLength="100"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="section-transition__trace section-transition__trace--orange"
          d="M-72 132C194 48 408 126 696 70C990 13 1210 54 1512 94"
          pathLength="100"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="section-transition__node"
          data-flow-decoration="node"
          d="M318 105h.01"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
