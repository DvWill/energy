"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import { withBasePath } from "@/lib/base-path";

const testimonials = [
  {
    src: "/assets/depoimentos/pastor-marcos-cidade-ocidental.mp4",
    poster: "/assets/depoimentos/capas/pastor-marcos-cidade-ocidental.webp",
    label: "Depoimento do Pastor Marcos, Cidade Ocidental",
  },
  {
    src: "/assets/depoimentos/rosilda-e-abel-valparaiso.mp4",
    poster: "/assets/depoimentos/capas/rosilda-e-abel-valparaiso.webp",
    label: "Depoimento de Rosilda e Abel, Valparaíso",
  },
  {
    src: "/assets/depoimentos/raiane-jardim-inga.mp4",
    poster: "/assets/depoimentos/capas/raiane-jardim-inga.webp",
    label: "Depoimento de Raiane, Jardim Ingá",
  },
  {
    src: "/assets/depoimentos/laerson-cidade-ocidental.mp4",
    poster: "/assets/depoimentos/capas/laerson-cidade-ocidental.webp",
    label: "Depoimento de Laerson, Cidade Ocidental",
  },
  {
    src: "/assets/depoimentos/dona-neuma-marajo.mp4",
    poster: "/assets/depoimentos/capas/dona-neuma-marajo.webp",
    label: "Depoimento de Dona Neuma, Marajó",
  },
  {
    src: "/assets/depoimentos/depoimento-abel-valparaiso.mp4",
    poster: "/assets/depoimentos/capas/depoimento-abel-valparaiso.webp",
    label: "Depoimento de Abel, Valparaíso",
  },
  {
    src: "/assets/depoimentos/whatsapp-audio-2026-10-21.mp4",
    poster: "/assets/depoimentos/capas/whatsapp-audio-2026-10-21.webp",
    label: "Depoimento de cliente",
  },
] as const;

export function CustomerTestimonialsSection() {
  const reduced = useAccessibleMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const scrollFrame = useRef<number | null>(null);
  const breakpointWasDesktop = useRef<boolean | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);

  const pauseAll = useCallback((except?: number) => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== except && !video.paused) video.pause();
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + testimonials.length) % testimonials.length;
      pauseAll();
      setActive(next);
      slideRefs.current[next]?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [pauseAll, reduced],
  );

  const play = async (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    pauseAll(index);
    setActive(index);
    try {
      await video.play();
    } catch {
      // The browser keeps the play control available when media playback is unavailable.
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pauseAll();
      },
      { threshold: 0.12 },
    );
    const slideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          const video = videoRefs.current[index];
          if (video && !video.paused) video.pause();
        });
      },
      { root: viewport, threshold: 0.55 },
    );

    sectionObserver.observe(section);
    slideRefs.current.forEach((slide) => slide && slideObserver.observe(slide));
    return () => {
      sectionObserver.disconnect();
      slideObserver.disconnect();
    };
  }, [pauseAll]);

  useEffect(
    () => () => {
      if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    },
    [],
  );

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const syncActiveCard = () => {
      if (breakpointWasDesktop.current === desktop.matches) return;
      breakpointWasDesktop.current = desktop.matches;
      setActive(desktop.matches ? 1 : 0);
    };

    syncActiveCard();
    desktop.addEventListener("change", syncActiveCard);
    return () => desktop.removeEventListener("change", syncActiveCard);
  }, []);

  const updateActiveFromScroll = () => {
    if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      let closestIndex = active;
      let closestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const bounds = slide.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActive(closestIndex);
    });
  };

  return (
    <section
      ref={sectionRef}
      id="depoimentos"
      className="testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <Container>
        <header className="testimonials-heading">
          <span>DEPOIMENTOS REAIS</span>
          <h2 id="testimonials-title">
            Quem confia na Energy, <em>recomenda.</em>
          </h2>
          <p>
            Nada melhor do que ouvir quem já vive a experiência de produzir a própria energia. Conheça os depoimentos dos nossos clientes.
          </p>
        </header>

        <div className="testimonials-carousel" role="region" aria-roledescription="carrossel" aria-label="Depoimentos em vídeo">
          <button
            type="button"
            className="testimonials-nav testimonials-nav-previous"
            onClick={() => goTo(active - 1)}
            aria-label="Ver depoimento anterior"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div
            ref={viewportRef}
            className="testimonials-viewport"
            onScroll={updateActiveFromScroll}
          >
            <div className="testimonials-track">
              {testimonials.map((testimonial, index) => {
                const nearActive = Math.min(
                  Math.abs(index - active),
                  testimonials.length - Math.abs(index - active),
                ) <= 1;
                return (
                  <article
                    ref={(element) => {
                      slideRefs.current[index] = element;
                    }}
                    className={`testimonial-video${active === index ? " is-active" : ""}`}
                    data-index={index}
                    key={testimonial.src}
                    aria-label={testimonial.label}
                  >
                    <video
                      ref={(element) => {
                        videoRefs.current[index] = element;
                      }}
                      controls
                      playsInline
                      poster={withBasePath(testimonial.poster)}
                      preload={nearActive ? "metadata" : "none"}
                      onPlay={() => {
                        pauseAll(index);
                        setPlaying(index);
                      }}
                      onPause={() => {
                        setPlaying((current) => (current === index ? null : current));
                      }}
                    >
                      <source src={withBasePath(testimonial.src)} type="video/mp4" />
                      Seu navegador não oferece suporte à reprodução de vídeo.
                    </video>
                    {playing !== index && (
                      <button
                        type="button"
                        className="testimonial-play"
                        onClick={() => play(index)}
                        aria-label={`Reproduzir: ${testimonial.label}`}
                      >
                        <Play aria-hidden="true" fill="currentColor" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="testimonials-nav testimonials-nav-next"
            onClick={() => goTo(active + 1)}
            aria-label="Ver próximo depoimento"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="testimonials-indicators" aria-label="Posição no carrossel">
          {testimonials.map((testimonial, index) => (
            <button
              type="button"
              key={testimonial.src}
              className={active === index ? "is-active" : undefined}
              onClick={() => goTo(index)}
              aria-label={`Ir para ${testimonial.label}`}
              aria-current={active === index ? "true" : undefined}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
