"use client";
import { useState } from "react";
import { Check, Copy, Linkedin, MessageCircle } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = (kind: "whatsapp" | "linkedin" | "facebook" | "x") => {
    const url = encodeURIComponent(location.href), text = encodeURIComponent(title);
    const targets = { whatsapp: `https://wa.me/?text=${text}%20${url}`, linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`, x: `https://x.com/intent/post?text=${text}&url=${url}` };
    window.open(targets[kind], "_blank", "noopener,noreferrer,width=720,height=560");
  };
  const copy = async () => { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return <div className="share-buttons" aria-label="Compartilhar publicação"><button onClick={copy} type="button">{copied ? <Check /> : <Copy />} {copied ? "Copiado" : "Copiar link"}</button><button onClick={() => share("whatsapp")} type="button"><MessageCircle /> WhatsApp</button><button onClick={() => share("linkedin")} type="button"><Linkedin /> LinkedIn</button><button onClick={() => share("facebook")} type="button">Facebook</button><button onClick={() => share("x")} type="button">X</button></div>;
}
