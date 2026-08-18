"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { ScrollProgress } from "@/components/motion/motion-primitives";
import { Brand } from "@/components/ui/brand";
import { siteContent as c } from "@/content/landing-page";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import { withBasePath } from "@/lib/base-path";
import { openLeadChat } from "@/lib/chat-events";
import {
  instantMenuVariants,
  menuVariants,
  microTransition,
} from "@/lib/motion";

const subscribeToHydration = () => () => {};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 48);
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }
    const sections = c.navigation
      .map((item) => item.href.match(/^\/#(.+)$/)?.[1])
      .filter((id): id is string => Boolean(id))
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const headerBottom =
        document.querySelector<HTMLElement>(".site-header .nav-wrap")
          ?.getBoundingClientRect().bottom ?? 0;
      const readingLine = Math.max(
        headerBottom + 12,
        window.innerHeight * 0.3,
      );
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= readingLine && rect.bottom > readingLine;
      });

      if (current) {
        setActiveId(current.id);
        return;
      }

      const previous = sections
        .filter((section) => section.getBoundingClientRect().top <= readingLine)
        .at(-1);
      setActiveId(previous?.id ?? "");
    };
    const onSectionScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    addEventListener("scroll", onSectionScroll, { passive: true });
    addEventListener("resize", onSectionScroll);
    return () => {
      removeEventListener("scroll", onSectionScroll);
      removeEventListener("resize", onSectionScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const resolveHref = (href: string) => {
    if (pathname === "/" && href.startsWith("/#")) return href.slice(1);
    return withBasePath(href);
  };

  const links = (mobile = false) => (
    <>
      {c.navigation.map((item) => {
        const sectionId = item.href.match(/^\/#(.+)$/)?.[1];
        const active =
          (item.href === "/blog" && pathname.startsWith("/blog")) ||
          (pathname === "/" && sectionId === activeId);
        return (
          <motion.a
            key={item.href}
            href={resolveHref(item.href)}
            tabIndex={mobile && hydrated && !open ? -1 : undefined}
            onClick={() => {
              setOpen(false);
              if (pathname === "/" && sectionId) setActiveId(sectionId);
            }}
            whileHover={
              finePointer && !reduced ? { x: 2, transition: microTransition } : undefined
            }
            className={active ? "active" : undefined}
            aria-current={
              active ? (item.href === "/blog" ? "page" : "location") : undefined
            }
          >
            {item.label}
          </motion.a>
        );
      })}
      <motion.a
        className="button button-small"
        href={resolveHref("/#calculadora")}
        tabIndex={mobile && hydrated && !open ? -1 : undefined}
        onClick={(event) => {
          setOpen(false);
          if (pathname === "/") {
            event.preventDefault();
            openLeadChat();
          }
        }}
        whileHover={
          finePointer && !reduced ? { scale: 1.025, y: -1 } : undefined
        }
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={microTransition}
      >
        {c.cta.primary}
      </motion.a>
    </>
  );

  return (
    <header
      className={`site-header ${scrolled ? "is-scrolled" : ""}`}
      data-scroll-state={scrolled ? "scrolled" : "top"}
    >
      <div className="nav-wrap container">
        <a
          href={pathname === "/" ? "#inicio" : withBasePath("/#inicio")}
          className="logo-link"
          aria-label="Energy — início"
        >
          <Brand adaptive />
        </a>
        <nav className="nav desktop-nav" aria-label="Navegação principal">
          {links()}
        </nav>
        <div className="header-actions">
          <button
            ref={menuButtonRef}
            className="menu-button"
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen(!open)}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                className="menu-icon"
                key={open ? "close" : "menu"}
                initial={
                  reduced ? false : { opacity: 0, rotate: -12, scale: 0.9 }
                }
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={
                  reduced ? undefined : { opacity: 0, rotate: 12, scale: 0.9 }
                }
                transition={reduced ? { duration: 0 } : microTransition}
              >
                {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <motion.nav
          id="main-nav"
          aria-label="Menu mobile"
          aria-hidden={hydrated ? !open : undefined}
          className={open ? "nav mobile-nav open" : "nav mobile-nav"}
          initial={false}
          animate={open ? "open" : "closed"}
          variants={reduced ? instantMenuVariants : menuVariants}
        >
          {links(true)}
        </motion.nav>
      </div>
      <ScrollProgress />
    </header>
  );
}
