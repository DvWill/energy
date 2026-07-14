import sanitizeHtml from "sanitize-html";

export function createSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

export function sanitizeArticleHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "em", "u", "ul", "ol", "li", "blockquote", "hr", "a", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "pre", "code"],
    allowedAttributes: {
      a: ["href", "target", "rel"], img: ["src", "alt", "width", "height", "loading"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tag, attrs) => {
        const external = /^https?:\/\//i.test(attrs.href ?? "");
        return { tagName: "a", attribs: { ...attrs, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } };
      },
      img: (_tag, attrs) => ({ tagName: "img", attribs: { ...attrs, loading: "lazy", alt: attrs.alt ?? "" } }),
    },
  });
}

export function plainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

export function readingTime(html: string) {
  const words = plainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function articleHeadings(html: string) {
  const headings: { level: 2 | 3; id: string; text: string }[] = [];
  const used = new Map<string, number>();
  const content = html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_all, tag: string, attrs: string, inner: string) => {
    const text = plainText(inner);
    let id = createSlug(text) || "secao";
    const count = used.get(id) ?? 0;
    used.set(id, count + 1);
    if (count) id = `${id}-${count + 1}`;
    headings.push({ level: tag.toLowerCase() === "h2" ? 2 : 3, id, text });
    const cleanAttrs = attrs.replace(/\s+id=("[^"]*"|'[^']*')/i, "");
    return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
  });
  return { content, headings };
}

export function safeWebUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}
