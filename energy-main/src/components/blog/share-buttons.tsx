"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Linkedin, MessageCircle } from "lucide-react";

type CopyStatus = "idle" | "copied" | "error";

export function ShareButtons({ title }: { title: string }) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const scheduleReset = () => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setCopyStatus("idle");
      resetTimer.current = null;
    }, 2_000);
  };

  const share = (kind: "whatsapp" | "linkedin" | "facebook" | "x") => {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(title);
    const targets = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://x.com/intent/post?text=${text}&url=${url}`,
    };

    window.open(
      targets[kind],
      "_blank",
      "noopener,noreferrer,width=720,height=560",
    );
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard indisponível");
      await navigator.clipboard.writeText(location.href);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    scheduleReset();
  };

  const message =
    copyStatus === "copied"
      ? "Link copiado para a área de transferência."
      : copyStatus === "error"
        ? "Não foi possível copiar o link."
        : "";

  return (
    <div
      className="share-buttons"
      role="group"
      aria-label="Compartilhar publicação"
    >
      <button
        onClick={copy}
        type="button"
        data-copy-state={copyStatus}
        aria-describedby="share-copy-status"
      >
        <span className="share-copy-icons" aria-hidden="true">
          <Copy className="share-copy-default" />
          <Check className="share-copy-success" />
        </span>
        {copyStatus === "copied" ? "Copiado" : "Copiar link"}
      </button>
      <button onClick={() => share("whatsapp")} type="button">
        <MessageCircle aria-hidden="true" /> WhatsApp
      </button>
      <button onClick={() => share("linkedin")} type="button">
        <Linkedin aria-hidden="true" /> LinkedIn
      </button>
      <button onClick={() => share("facebook")} type="button">
        Facebook
      </button>
      <button onClick={() => share("x")} type="button">
        X
      </button>
      <span
        id="share-copy-status"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
      </span>
    </div>
  );
}
