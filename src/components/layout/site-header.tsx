"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteContent as c } from "@/content/landing-page";
import { Brand } from "@/components/ui/brand";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 12);
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Container className="nav-wrap">
        <a href="#inicio" className="logo-link">
          <Brand />
        </a>
        <button
          className="menu-button"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-nav"
          aria-label="Navegação principal"
          className={open ? "nav open" : "nav"}
        >
          {c.navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a
            className="button button-small"
            href="#contato"
            onClick={() => setOpen(false)}
          >
            {c.cta.primary}
          </a>
        </nav>
      </Container>
    </header>
  );
}
