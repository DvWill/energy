"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { siteContent as c } from "@/content/landing-page";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";

const countDuration = 1_050;

type Metric = (typeof c.metrics)[number];

function AnimatedMetric({
  value,
  suffix,
  label,
  delay,
}: Metric & { delay: number }) {
  const metricRef = useRef<HTMLElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [counting, setCounting] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const reduced = useAccessibleMotion();

  const cancelCount = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startCount = useCallback(() => {
    if (completedRef.current) return;
    cancelCount();

    if (reduced) {
      setDisplayValue(value);
      setCounting(false);
      completedRef.current = true;
      return;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      const startedAt = performance.now();
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
        completedRef.current = true;
        setDisplayValue(value);
        setCounting(false);
      };

      frameRef.current = requestAnimationFrame(update);
    }, delay);
  }, [cancelCount, delay, reduced, value]);

  useEffect(() => {
    const metric = metricRef.current;
    if (!metric) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startCount();
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(metric);
    return () => observer.disconnect();
  }, [startCount]);

  useEffect(() => cancelCount, [cancelCount]);

  return (
    <article
      ref={metricRef}
      className="solar-metric"
      data-counting={counting ? "true" : "false"}
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
          {c.metrics.map((metric, index) => (
            <AnimatedMetric
              key={metric.label}
              {...metric}
              delay={index * 140}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
