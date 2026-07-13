"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { siteContent as c } from "@/content/landing-page";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { elementTransition, menuVariants, microTransition } from "@/lib/motion";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";

const subscribeToHydration = () => () => {};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = useAccessibleMotion();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 48);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const links = (mobile = false) => (
    <>
      {c.navigation.map((item) => (
        <motion.a
          key={item.href}
          href={item.href}
          tabIndex={mobile && hydrated && !open ? -1 : undefined}
          onClick={() => setOpen(false)}
          whileHover={reduced ? undefined : { x: 2 }}
          transition={microTransition}
        >
          {item.label}
        </motion.a>
      ))}
      <motion.a
        className="button button-small"
        href="#contato"
        tabIndex={mobile && hydrated && !open ? -1 : undefined}
        onClick={() => setOpen(false)}
        whileHover={reduced ? undefined : { scale: 1.025, y: -1 }}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={microTransition}
      >
        {c.cta.primary}
      </motion.a>
    </>
  );

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <motion.div
        className="nav-wrap container"
        initial={false}
        animate={{
          height: scrolled ? 58 : 64,
          boxShadow: scrolled
            ? "0 14px 38px rgba(0,0,0,.24)"
            : "0 10px 34px rgba(0,0,0,.16)",
        }}
        transition={reduced ? { duration: 0 } : elementTransition}
      >
        <a href="#inicio" className="logo-link" aria-label="Energy — início">
          <Brand />
        </a>
        <nav className="nav desktop-nav" aria-label="Navegação principal">
          {links()}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
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
                transition={microTransition}
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
          variants={reduced ? undefined : menuVariants}
          transition={reduced ? { duration: 0 } : elementTransition}
        >
          {links(true)}
        </motion.nav>
      </motion.div>
    </header>
  );
}
