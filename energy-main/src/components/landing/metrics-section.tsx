"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";

const countDuration = 1_050;

type Metric = (typeof c.metrics)[number];

function AnimatedMetric({ value, suffix, label }: Metric) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [counting, setCounting] = useState(false);
  const frameRef = useRef<number | null>(null);
  const reduced = useAccessibleMotion();

  const cancelCount = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const startCount = useCallback(() => {
    cancelCount();

    if (reduced) {
      setDisplayValue(value);
      setCounting(false);
      return;
    }

    const startedAt = performance.now();
    setDisplayValue(0);
    setCounting(true);

    const update = (now: number) => {
      const progress = Math.min((now - startedAt) / countDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(update);
        return;
      }

      frameRef.current = null;
      setDisplayValue(value);
      setCounting(false);
    };

    frameRef.current = requestAnimationFrame(update);
  }, [cancelCount, reduced, value]);

  useEffect(() => cancelCount, [cancelCount]);

  return (
    <article
      className="solar-metric"
      data-counting={counting ? "true" : "false"}
      onPointerEnter={startCount}
      onFocus={startCount}
      tabIndex={0}
    >
      <span className="solar-metric-value" aria-hidden="true">
        {displayValue}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <p className="solar-metric-label">{label}</p>
    </article>
  );
}

export function MetricsSection() {
  return (
    <section
      className="solar-metrics-section"
      aria-label="Resultados da Energy"
    >
      <Container>
        <div className="solar-metrics-card">
          {c.metrics.map((metric) => (
            <AnimatedMetric key={metric.label} {...metric} />
          ))}
        </div>
      </Container>
    </section>
  );
}
