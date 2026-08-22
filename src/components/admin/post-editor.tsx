"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  savePostAction,
  type AdminFormState,
} from "@/app/admin/(protected)/blog/actions";
import type { Author, Category, Post } from "@/db/schema";
import { createSlug } from "@/lib/blog";
import { ImageUpload, type UploadedImage } from "./image-upload";

type FieldErrors = Record<string, string[]>;
type EditorStatus = Post["status"];

const BRAZIL_TIME_ZONE = "America/Sao_Paulo";
const fieldLabels: Record<string, string> = {
  title: "Título",
  slug: "Endereço da publicação",
  subtitle: "Subtítulo",
  summary: "Resumo",
  content: "Conteúdo",
  sourceName: "Nome da fonte",
  sourceUrl: "Link da notícia original",
  coverImageUrl: "Imagem de capa",
  coverImageAlt: "Texto alternativo da capa",
  coverImageCaption: "Legenda da capa",
  scheduledAt: "Data do agendamento",
  publishedAt: "Data de publicação",
  metaTitle: "Título para buscadores",
  metaDescription: "Descrição para buscadores",
  canonicalUrl: "Endereço canônico",
  socialImageUrl: "Imagem para redes sociais",
  status: "Ação de publicação",
  categoryId: "Categoria",
  authorId: "Autor",
};

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function localDate(value: Date | null | undefined) {
  if (!value) return "";
  const parts = zonedParts(value);
  const pad = (item: number) => String(item).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function zoneOffset(date: Date) {
  const parts = zonedParts(date);
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ) - date.getTime()
  );
}

function localBrazilDateToIso(value: string) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return "";
  const [, year, month, day, hour, minute] = match.map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utc = localAsUtc - zoneOffset(new Date(localAsUtc));
  utc = localAsUtc - zoneOffset(new Date(utc));
  return new Date(utc).toISOString();
}

function visibleText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();
}

const visualBlockTags = new Set([
  "P",
  "H2",
  "H3",
  "H4",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "HR",
  "FIGURE",
  "FIGCAPTION",
  "TABLE",
  "THEAD",
  "TBODY",
  "TR",
  "TH",
  "TD",
  "PRE",
]);

function normalizedVisualFragment(nodes: ChildNode[]) {
  const fragment = document.createDocumentFragment();
  let paragraph: HTMLParagraphElement | null = null;

  for (const node of nodes) {
    const isBlock =
      node instanceof HTMLElement && visualBlockTags.has(node.tagName);
    if (isBlock) {
      paragraph = null;
      fragment.append(node);
      continue;
    }
    if (
      node.nodeType === Node.TEXT_NODE &&
      !node.textContent?.trim() &&
      !paragraph
    ) {
      continue;
    }
    if (!paragraph) {
      paragraph = document.createElement("p");
      fragment.append(paragraph);
    }
    paragraph.append(node);
  }

  return fragment;
}

function normalizeVisualEditorHtml(value: string) {
  const container = document.createElement("div");
  container.innerHTML = sanitizeEditorHtml(value);

  for (const element of Array.from(container.querySelectorAll("b, i"))) {
    const replacement = document.createElement(
      element.tagName === "B" ? "strong" : "em",
    );
    replacement.append(...Array.from(element.childNodes));
    element.replaceWith(replacement);
  }

  const divs = Array.from(container.querySelectorAll("div")).reverse();
  for (const div of divs) {
    const replacement = normalizedVisualFragment(Array.from(div.childNodes));
    if (!replacement.childNodes.length) {
      const emptyParagraph = document.createElement("p");
      emptyParagraph.append(document.createElement("br"));
      replacement.append(emptyParagraph);
    }
    div.replaceWith(replacement);
  }

  const normalized = document.createElement("div");
  normalized.append(normalizedVisualFragment(Array.from(container.childNodes)));
  return normalized.innerHTML;
}

const editorTags = new Set([
  "P", "BR", "H2", "H3", "H4", "STRONG", "EM", "U", "UL", "OL",
  "LI", "BLOCKQUOTE", "HR", "A", "IMG", "FIGURE", "FIGCAPTION", "TABLE",
  "THEAD", "TBODY", "TR", "TH", "TD", "PRE", "CODE",
]);
const editorAttributes = new Set([
  "href", "target", "rel", "src", "alt", "width", "height", "loading",
]);

function sanitizeEditorHtml(value: string) {
  const template = document.createElement("template");
  template.innerHTML = value;
  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    if (!editorTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim();
      if (!editorAttributes.has(name) || name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (name === "href" && !isEditorUrl(attributeValue, true)) {
        element.removeAttribute(attribute.name);
      } else if (name === "src" && !isEditorUrl(attributeValue, false)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}

function isEditorUrl(value: string, allowMailto: boolean) {
  try {
    const url = new URL(value, window.location.origin);
    const protocols = allowMailto
      ? ["http:", "https:", "mailto:", "tel:"]
      : ["http:", "https:"];
    return protocols.includes(url.protocol) && !url.username && !url.password;
  } catch {
    return value.startsWith("/") && !value.startsWith("//");
  }
}

function isHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function isImageLocation(value: string) {
  if (
    /^\/(?:images|assets|brand)\/[a-zA-Z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(
      value,
    )
  ) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function focusField(field: string) {
  const target = document.getElementById(field);
  if (!target) return;
  target.closest("details")?.setAttribute("open", "");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => target.focus(), 250);
}

function FieldError({ field, errors }: { field: string; errors: FieldErrors }) {
  const message = errors[field]?.[0];
  if (!message) return null;
  return (
    <small className="field-error" id={`${field}-error`}>
      {message}
    </small>
  );
}

function VisualContentEditor({
  value,
  onChange,
  invalid,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  required: boolean;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const normalizedInitialValue = value === "<p></p>" ? "" : value;
  const initialHtml = useRef(normalizedInitialValue);
  const [empty, setEmpty] = useState(
    () => visibleText(normalizedInitialValue).length === 0,
  );

  useEffect(() => {
    if (editor.current) editor.current.innerHTML = sanitizeEditorHtml(initialHtml.current);
  }, []);

  const sync = () => {
    const html = normalizeVisualEditorHtml(editor.current?.innerHTML ?? "");
    onChange(html);
    setEmpty(visibleText(html).length === 0);
  };

  const command = (name: string, commandValue?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, commandValue);
    sync();
  };

  const addLink = () => {
    const url = window.prompt(
      "Cole o endereço completo do link (https://...):",
    );
    if (!url) return;
    if (!isHttpUrl(url)) {
      window.alert("Informe um endereço iniciado por http:// ou https://.");
      return;
    }
    command("createLink", url);
  };

  const preserveSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <div
        className="editor-toolbar"
        role="toolbar"
        aria-label="Formatação do conteúdo"
      >
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("formatBlock", "p")}
        >
          Parágrafo
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("formatBlock", "h2")}
        >
          Título 2
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("formatBlock", "h3")}
        >
          Título 3
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("bold")}
        >
          Negrito
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("italic")}
        >
          Itálico
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("insertUnorderedList")}
        >
          Lista
        </button>
        <button
          type="button"
          onMouseDown={preserveSelection}
          onClick={() => command("formatBlock", "blockquote")}
        >
          Citação
        </button>
        <button type="button" onMouseDown={preserveSelection} onClick={addLink}>
          Link
        </button>
      </div>
      <div
        ref={editor}
        id="content"
        className="visual-content-editor"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Conteúdo da publicação"
        aria-required={required}
        aria-invalid={invalid}
        aria-describedby={invalid ? "content-error" : "content-help"}
        data-empty={empty ? "true" : "false"}
        data-placeholder="Comece a escrever aqui. Você pode colar um texto pronto e formatá-lo com os botões acima."
        onInput={sync}
        onBlur={sync}
      />
    </>
  );
}

export function PostEditor({
  post,
  categories,
  authors,
  imageUploadsEnabled,
}: {
  post?: Post;
  categories: Category[];
  authors: Author[];
  imageUploadsEnabled: boolean;
}) {
  const bound = savePostAction.bind(null, post?.id ?? null);
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    bound,
    {
      error: "",
    },
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [slugOptionsOpen, setSlugOptionsOpen] = useState(Boolean(post));
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [contentValue, setContentValue] = useState(post?.content ?? "");
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [sourceName, setSourceName] = useState(post?.sourceName ?? "");
  const [sourceUrl, setSourceUrl] = useState(post?.sourceUrl ?? "");
  const [sourceOptionsOpen, setSourceOptionsOpen] = useState(
    Boolean(post?.sourceName || post?.sourceUrl),
  );
  const [status, setStatus] = useState<EditorStatus>(post?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState(localDate(post?.publishedAt));
  const [scheduledAt, setScheduledAt] = useState(localDate(post?.scheduledAt));
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [authorId, setAuthorId] = useState(post?.authorId ?? "");
  const [cover, setCover] = useState<UploadedImage | null>(
    post?.coverImageUrl
      ? {
          url: post.coverImageUrl,
          id: post.coverImageId ?? "",
          width: post.coverImageWidth ?? 1600,
          height: post.coverImageHeight ?? 900,
        }
      : null,
  );
  const [coverUrl, setCoverUrl] = useState(post?.coverImageUrl ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.coverImageAlt ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [clientMessage, setClientMessage] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const [dismissedServerFields, setDismissedServerFields] = useState<
    Set<string>
  >(new Set());
  const errorSummary = useRef<HTMLDivElement>(null);

  const fieldErrors: FieldErrors = {};
  for (const [field, messages] of Object.entries(state.fields ?? {})) {
    if (!dismissedServerFields.has(field)) fieldErrors[field] = messages;
  }
  Object.assign(fieldErrors, clientErrors);

  useEffect(() => {
    if (!state.error) return;
    const firstField = Object.keys(state.fields ?? {})[0];
    const timer = window.setTimeout(() => {
      if (firstField) focusField(firstField);
      else errorSummary.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [state.error, state.fields]);

  const clearFieldError = (field: string) => {
    setClientErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setDismissedServerFields((current) => {
      if (current.has(field)) return current;
      const next = new Set(current);
      next.add(field);
      return next;
    });
  };

  const contentLength = visibleText(contentValue).length;
  const sourceStarted = Boolean(sourceName.trim() || sourceUrl.trim());
  const normalizedCoverUrl = coverUrl.trim();
  const hasCover = Boolean(
    normalizedCoverUrl && isImageLocation(normalizedCoverUrl),
  );
  const isPublishableStatus = status === "PUBLISHED" || status === "SCHEDULED";
  const publicationChecklist = [
    {
      field: "title",
      label: "Título com pelo menos 5 caracteres",
      complete: title.trim().length >= 5,
    },
    {
      field: "summary",
      label: "Resumo com pelo menos 20 caracteres",
      complete: summary.trim().length >= 20,
    },
    {
      field: "content",
      label: "Conteúdo com pelo menos 20 caracteres",
      complete: contentLength >= 20,
    },
    ...(sourceStarted
      ? [
          {
            field: sourceName.trim() ? "sourceUrl" : "sourceName",
            label: "Nome e link da fonte preenchidos",
            complete: Boolean(
              sourceName.trim() && sourceUrl.trim() && isHttpUrl(sourceUrl),
            ),
          },
        ]
      : []),
    ...(hasCover
      ? [
          {
            field: "coverImageAlt",
            label: "Descrição da imagem de capa",
            complete: coverAlt.trim().length > 0,
          },
        ]
      : []),
    ...(status === "SCHEDULED"
      ? [
          {
            field: "scheduledAt",
            label: "Data futura para o agendamento",
            complete:
              Boolean(scheduledAt) &&
              new Date(localBrazilDateToIso(scheduledAt)).getTime() >
                renderedAt,
          },
        ]
      : []),
  ];
  const missingForPublication = publicationChecklist.filter(
    (item) => !item.complete,
  );

  const validate = (intent: "save" | "draft") => {
    const errors: FieldErrors = {};
    const add = (field: string, message: string) => {
      if (!errors[field]) errors[field] = [message];
    };
    const effectiveStatus: EditorStatus = intent === "draft" ? "DRAFT" : status;
    const publishable =
      effectiveStatus === "PUBLISHED" || effectiveStatus === "SCHEDULED";

    if (!publishable && title.trim().length < 3) {
      add("title", "Informe um título com pelo menos 3 caracteres.");
    }
    if (slug.trim().length < 3)
      add("slug", "Informe um endereço com pelo menos 3 caracteres.");
    if (sourceUrl.trim() && !isHttpUrl(sourceUrl.trim())) {
      add("sourceUrl", "Informe um endereço iniciado por http:// ou https://.");
    }
    if (publishable && title.trim().length < 5) {
      add("title", "Para publicar, use um título com pelo menos 5 caracteres.");
    }
    if (publishable && summary.trim().length < 20) {
      add("summary", "Escreva um resumo com pelo menos 20 caracteres.");
    }
    if (publishable && contentLength < 20) {
      add("content", "Escreva pelo menos 20 caracteres de conteúdo.");
    }
    if (publishable && sourceUrl.trim() && !sourceName.trim()) {
      add("sourceName", "Informe o nome da fonte da notícia.");
    }
    if (publishable && sourceName.trim() && !sourceUrl.trim()) {
      add("sourceUrl", "Informe o link da notícia original.");
    }
    if (coverUrl.trim() && !isImageLocation(coverUrl.trim())) {
      add(
        "coverImageUrl",
        "Informe uma URL HTTPS válida para a imagem de capa.",
      );
    }
    if (publishable && hasCover && !coverAlt.trim()) {
      add("coverImageAlt", "Descreva a imagem de capa para acessibilidade.");
    }
    if (effectiveStatus === "SCHEDULED") {
      const scheduledTime = new Date(
        localBrazilDateToIso(scheduledAt),
      ).getTime();
      if (!scheduledAt)
        add("scheduledAt", "Defina a data e a hora do agendamento.");
      else if (!Number.isFinite(scheduledTime) || scheduledTime <= Date.now()) {
        add("scheduledAt", "Escolha uma data futura para o agendamento.");
      }
    }
    if (effectiveStatus === "PUBLISHED" && publishedAt) {
      const publicationTime = new Date(
        localBrazilDateToIso(publishedAt),
      ).getTime();
      if (publicationTime > Date.now() + 60_000) {
        add(
          "publishedAt",
          "Para publicar no futuro, escolha o status Agendada.",
        );
      }
    }
    if (uploadBusy) add("coverImageUrl", "Aguarde o envio da imagem terminar.");
    return errors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "draft" ? "draft" : "save";
    const errors = validate(intent);
    if (Object.keys(errors).length) {
      event.preventDefault();
      setClientErrors(errors);
      setClientMessage(
        "Ainda faltam algumas informações. Corrija os campos indicados abaixo.",
      );
      const firstField = Object.keys(errors)[0];
      window.setTimeout(() => focusField(firstField), 0);
      return;
    }
    setClientErrors({});
    setClientMessage("");
    setDismissedServerFields(new Set());
  };

  const changeStatus = (nextStatus: EditorStatus) => {
    const previousStatus = status;
    setStatus(nextStatus);
    clearFieldError("status");
    if (previousStatus === "SCHEDULED" && nextStatus === "PUBLISHED") {
      setPublishedAt("");
      clearFieldError("publishedAt");
    }
    if (nextStatus === "SCHEDULED" && !scheduledAt) {
      setScheduledAt(localDate(new Date(Date.now() + 60 * 60 * 1000)));
    }
  };

  const primaryLabel = uploadBusy
    ? "Aguarde a imagem…"
    : pending
      ? "Salvando…"
      : status === "PUBLISHED"
        ? "Publicar agora"
        : status === "SCHEDULED"
          ? "Agendar publicação"
          : status === "ARCHIVED"
            ? "Arquivar publicação"
            : "Salvar rascunho";
  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const serverFieldNames = Object.keys(state.fields ?? {});
  const hasActiveServerErrors = serverFieldNames.some(
    (field) => !dismissedServerFields.has(field),
  );
  const visibleMessage = hasClientErrors
    ? clientMessage
    : state.error && (!serverFieldNames.length || hasActiveServerErrors)
      ? state.error
      : "";
  const readinessClass =
    status === "ARCHIVED" ||
    (status === "DRAFT" && missingForPublication.length)
      ? "informational"
      : missingForPublication.length
        ? "needs-attention"
        : "ready";
  const readinessTitle =
    status === "ARCHIVED"
      ? "Conteúdo arquivado"
      : missingForPublication.length
        ? isPublishableStatus
          ? `Faltam ${missingForPublication.length} ${missingForPublication.length === 1 ? "item" : "itens"}`
          : `Para publicar depois, faltam ${missingForPublication.length} ${missingForPublication.length === 1 ? "item" : "itens"}`
        : status === "SCHEDULED"
          ? "Pronto para agendar"
          : status === "PUBLISHED"
            ? "Pronto para publicar"
            : "Rascunho pronto para publicar";

  return (
    <form
      action={action}
      className="post-editor"
      noValidate
      onSubmit={handleSubmit}
    >
      {visibleMessage && (
        <div
          ref={errorSummary}
          className="admin-error admin-error-summary"
          role="alert"
          tabIndex={-1}
        >
          <strong>{visibleMessage}</strong>
          {Object.keys(fieldErrors).length > 0 && (
            <ul>
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <li key={field}>
                  <a href={`#${field}`} onClick={() => focusField(field)}>
                    {fieldLabels[field] ?? field}: {messages[0]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="editor-main">
        <p className="editor-required-note">
          Comece pelo essencial. O endereço é criado automaticamente e as opções
          avançadas podem ficar para depois.
        </p>

        <div className={`admin-field ${fieldErrors.title ? "has-error" : ""}`}>
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              clearFieldError("title");
              if (!slugTouched) {
                setSlug(createSlug(nextTitle));
                clearFieldError("slug");
              }
            }}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "title-error" : "title-count"}
            minLength={3}
            maxLength={180}
            autoFocus={!post}
          />
          <div className="field-meta" id="title-count">
            <small>Seja claro e direto.</small>
            <span>{title.length}/180</span>
          </div>
          <FieldError field="title" errors={fieldErrors} />
        </div>

        <details
          className="editor-disclosure"
          open={slugOptionsOpen}
          onToggle={(event) => setSlugOptionsOpen(event.currentTarget.open)}
        >
          <summary>
            <span>Endereço da publicação</span>
            <small>Gerado automaticamente</small>
          </summary>
          <div className="editor-disclosure-content">
            <div
              className={`admin-field ${fieldErrors.slug ? "has-error" : ""}`}
            >
              <label htmlFor="slug">Final do endereço</label>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(createSlug(event.target.value));
                  clearFieldError("slug");
                }}
                aria-invalid={Boolean(fieldErrors.slug)}
                aria-describedby={
                  fieldErrors.slug ? "slug-error" : "slug-preview"
                }
                minLength={3}
                maxLength={160}
              />
              <small id="slug-preview" className="slug-preview">
                /blog/{slug || "titulo-da-publicacao"}
              </small>
              <FieldError field="slug" errors={fieldErrors} />
            </div>
          </div>
        </details>

        <div
          className={`admin-field ${fieldErrors.subtitle ? "has-error" : ""}`}
        >
          <label htmlFor="subtitle">
            Subtítulo <span className="optional-label">opcional</span>
          </label>
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={post?.subtitle ?? ""}
            onChange={() => clearFieldError("subtitle")}
            maxLength={240}
            aria-invalid={Boolean(fieldErrors.subtitle)}
            aria-describedby={
              fieldErrors.subtitle ? "subtitle-error" : undefined
            }
          />
          <FieldError field="subtitle" errors={fieldErrors} />
        </div>

        <div
          className={`admin-field ${fieldErrors.summary ? "has-error" : ""}`}
        >
          <label htmlFor="summary">
            Resumo {status === "PUBLISHED" || status === "SCHEDULED" ? "*" : ""}
          </label>
          <textarea
            id="summary"
            name="summary"
            value={summary}
            onChange={(event) => {
              setSummary(event.target.value);
              clearFieldError("summary");
            }}
            rows={4}
            aria-required={status === "PUBLISHED" || status === "SCHEDULED"}
            aria-invalid={Boolean(fieldErrors.summary)}
            aria-describedby={
              fieldErrors.summary ? "summary-error" : "summary-count"
            }
            maxLength={500}
            placeholder="Explique em poucas linhas por que esta publicação é importante."
          />
          <div className="field-meta" id="summary-count">
            <small>
              Este texto aparece nos cards e nos resultados de busca.
            </small>
            <span>{summary.length}/500</span>
          </div>
          <FieldError field="summary" errors={fieldErrors} />
        </div>

        <div
          className={`admin-field content-field ${fieldErrors.content ? "has-error" : ""}`}
        >
          <div className="field-heading-row">
            <label htmlFor="content">
              Conteúdo{" "}
              {status === "PUBLISHED" || status === "SCHEDULED" ? "*" : ""}
            </label>
            <div
              className="editor-mode-switch"
              role="group"
              aria-label="Modo do editor"
            >
              <button
                type="button"
                className={editorMode === "visual" ? "active" : ""}
                aria-pressed={editorMode === "visual"}
                onClick={() => setEditorMode("visual")}
              >
                Visual
              </button>
              <button
                type="button"
                className={editorMode === "html" ? "active" : ""}
                aria-pressed={editorMode === "html"}
                onClick={() => setEditorMode("html")}
              >
                HTML
              </button>
            </div>
          </div>
          {editorMode === "visual" ? (
            <VisualContentEditor
              value={contentValue}
              onChange={(nextValue) => {
                setContentValue(nextValue);
                clearFieldError("content");
              }}
              invalid={Boolean(fieldErrors.content)}
              required={isPublishableStatus}
            />
          ) : (
            <textarea
              id="content"
              className="html-content-editor"
              value={contentValue}
              onChange={(event) => {
                setContentValue(event.target.value);
                clearFieldError("content");
              }}
              rows={20}
              aria-required={isPublishableStatus}
              aria-invalid={Boolean(fieldErrors.content)}
              aria-describedby={
                fieldErrors.content ? "content-error" : "content-help"
              }
            />
          )}
          <input type="hidden" name="content" value={contentValue} />
          <div className="field-meta" id="content-help">
            <small>
              Use o modo visual para escrever normalmente; o HTML é opcional.
            </small>
            <span>{contentLength} caracteres</span>
          </div>
          <FieldError field="content" errors={fieldErrors} />
        </div>

        <details
          className="editor-disclosure"
          open={sourceOptionsOpen}
          onToggle={(event) => setSourceOptionsOpen(event.currentTarget.open)}
        >
          <summary>
            <span>Fonte da notícia</span>
            <small>Opcional</small>
          </summary>
          <div className="editor-disclosure-content">
            <p className="disclosure-intro">
              Se o conteúdo veio de outra notícia, informe o nome e o link. Os
              dois campos são usados juntos.
            </p>
            <div
              className={`admin-field ${fieldErrors.sourceName ? "has-error" : ""}`}
            >
              <label htmlFor="sourceName">Nome da fonte</label>
              <input
                id="sourceName"
                name="sourceName"
                value={sourceName}
                onChange={(event) => {
                  setSourceName(event.target.value);
                  clearFieldError("sourceName");
                }}
                maxLength={160}
                placeholder="Ex.: ANEEL"
                aria-invalid={Boolean(fieldErrors.sourceName)}
                aria-describedby={
                  fieldErrors.sourceName ? "sourceName-error" : undefined
                }
              />
              <FieldError field="sourceName" errors={fieldErrors} />
            </div>
            <div
              className={`admin-field ${fieldErrors.sourceUrl ? "has-error" : ""}`}
            >
              <label htmlFor="sourceUrl">Link da notícia original</label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(event) => {
                  setSourceUrl(event.target.value);
                  clearFieldError("sourceUrl");
                }}
                maxLength={2048}
                placeholder="https://..."
                aria-invalid={Boolean(fieldErrors.sourceUrl)}
                aria-describedby={
                  fieldErrors.sourceUrl ? "sourceUrl-error" : undefined
                }
              />
              <FieldError field="sourceUrl" errors={fieldErrors} />
            </div>
          </div>
        </details>

        <details className="editor-disclosure">
          <summary>
            <span>SEO e compartilhamento</span>
            <small>Avançado e opcional</small>
          </summary>
          <div className="editor-disclosure-content">
            <p className="disclosure-intro">
              Se deixar em branco, o site usa o título, o resumo e a imagem de
              capa automaticamente.
            </p>
            <div
              className={`admin-field ${fieldErrors.metaTitle ? "has-error" : ""}`}
            >
              <label htmlFor="metaTitle">Título para buscadores</label>
              <input
                id="metaTitle"
                name="metaTitle"
                defaultValue={post?.metaTitle ?? ""}
                onChange={() => clearFieldError("metaTitle")}
                maxLength={70}
                aria-invalid={Boolean(fieldErrors.metaTitle)}
                aria-describedby={
                  fieldErrors.metaTitle ? "metaTitle-error" : undefined
                }
              />
              <FieldError field="metaTitle" errors={fieldErrors} />
            </div>
            <div
              className={`admin-field ${fieldErrors.metaDescription ? "has-error" : ""}`}
            >
              <label htmlFor="metaDescription">Descrição para buscadores</label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                defaultValue={post?.metaDescription ?? ""}
                onChange={() => clearFieldError("metaDescription")}
                maxLength={170}
                aria-invalid={Boolean(fieldErrors.metaDescription)}
                aria-describedby={
                  fieldErrors.metaDescription
                    ? "metaDescription-error"
                    : undefined
                }
              />
              <FieldError field="metaDescription" errors={fieldErrors} />
            </div>
            <div
              className={`admin-field ${fieldErrors.canonicalUrl ? "has-error" : ""}`}
            >
              <label htmlFor="canonicalUrl">
                Endereço canônico personalizado
              </label>
              <input
                id="canonicalUrl"
                name="canonicalUrl"
                type="url"
                defaultValue={post?.canonicalUrl ?? ""}
                onChange={() => clearFieldError("canonicalUrl")}
                aria-invalid={Boolean(fieldErrors.canonicalUrl)}
                aria-describedby={
                  fieldErrors.canonicalUrl ? "canonicalUrl-error" : undefined
                }
              />
              <FieldError field="canonicalUrl" errors={fieldErrors} />
            </div>
            <div
              className={`admin-field ${fieldErrors.socialImageUrl ? "has-error" : ""}`}
            >
              <label htmlFor="socialImageUrl">
                Imagem para redes sociais (URL)
              </label>
              <input
                id="socialImageUrl"
                name="socialImageUrl"
                type="url"
                defaultValue={post?.socialImageUrl ?? ""}
                onChange={() => clearFieldError("socialImageUrl")}
                aria-invalid={Boolean(fieldErrors.socialImageUrl)}
                aria-describedby={
                  fieldErrors.socialImageUrl
                    ? "socialImageUrl-error"
                    : undefined
                }
              />
              <FieldError field="socialImageUrl" errors={fieldErrors} />
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                name="noIndex"
                defaultChecked={post?.noIndex}
              />
              Não indexar esta publicação nos buscadores
            </label>
          </div>
        </details>
      </div>

      <aside className="editor-sidebar">
        <fieldset className="editor-publish-card">
          <legend>Publicação</legend>
          <div
            className={`admin-field ${fieldErrors.status ? "has-error" : ""}`}
          >
            <label htmlFor="status">O que você quer fazer?</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) =>
                changeStatus(event.target.value as EditorStatus)
              }
              aria-invalid={Boolean(fieldErrors.status)}
              aria-describedby={fieldErrors.status ? "status-error" : undefined}
            >
              <option value="DRAFT">Salvar como rascunho</option>
              <option value="PUBLISHED">Publicar agora</option>
              <option value="SCHEDULED">Agendar publicação</option>
              <option value="ARCHIVED">Arquivar</option>
            </select>
            <FieldError field="status" errors={fieldErrors} />
          </div>

          {status === "PUBLISHED" && (
            <div
              className={`admin-field ${fieldErrors.publishedAt ? "has-error" : ""}`}
            >
              <label htmlFor="publishedAt">Data de publicação</label>
              <input
                id="publishedAt"
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => {
                  setPublishedAt(event.target.value);
                  clearFieldError("publishedAt");
                }}
                aria-invalid={Boolean(fieldErrors.publishedAt)}
                aria-describedby={
                  fieldErrors.publishedAt
                    ? "publishedAt-error"
                    : "publishedAt-help"
                }
              />
              <input
                type="hidden"
                name="publishedAt"
                value={localBrazilDateToIso(publishedAt)}
              />
              <small id="publishedAt-help">
                Deixe vazio para publicar agora. Horário de Brasília.
              </small>
              <FieldError field="publishedAt" errors={fieldErrors} />
            </div>
          )}

          {status === "SCHEDULED" && (
            <div
              className={`admin-field ${fieldErrors.scheduledAt ? "has-error" : ""}`}
            >
              <label htmlFor="scheduledAt">Agendar para *</label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => {
                  setScheduledAt(event.target.value);
                  clearFieldError("scheduledAt");
                }}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.scheduledAt)}
                aria-describedby={
                  fieldErrors.scheduledAt
                    ? "scheduledAt-error"
                    : "scheduledAt-help"
                }
              />
              <input
                type="hidden"
                name="scheduledAt"
                value={localBrazilDateToIso(scheduledAt)}
              />
              <small id="scheduledAt-help">
                A publicação aparecerá automaticamente. Horário de Brasília.
              </small>
              <FieldError field="scheduledAt" errors={fieldErrors} />
            </div>
          )}

          {status === "DRAFT" && (
            <p className="status-explanation">
              O rascunho pode ser salvo mesmo incompleto e não aparece no blog.
            </p>
          )}
          {status === "ARCHIVED" && (
            <p className="status-explanation">
              A publicação ficará guardada no painel e não aparecerá no blog.
            </p>
          )}

          {status === "PUBLISHED" && (
            <label className="admin-check">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={post?.isFeatured}
              />
              Destacar no blog
            </label>
          )}

          <div
            className={`editor-readiness ${readinessClass}`}
            aria-live="polite"
          >
            <strong>{readinessTitle}</strong>
            {status === "ARCHIVED" ? (
              <small>
                O checklist editorial volta a ser aplicado quando você escolher
                publicar ou agendar novamente.
              </small>
            ) : (
              <>
                <ul>
                  {publicationChecklist.map((item) => (
                    <li
                      className={item.complete ? "complete" : ""}
                      key={item.label}
                    >
                      <button
                        type="button"
                        onClick={() => focusField(item.field)}
                      >
                        <span aria-hidden="true">
                          {item.complete ? "✓" : "○"}
                        </span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
                {isPublishableStatus && (!categoryId || !hasCover) && (
                  <small>
                    Recomendado: {!categoryId && "escolha uma categoria"}
                    {!categoryId && !hasCover && " e "}
                    {!hasCover && "adicione uma imagem de capa"}.
                  </small>
                )}
              </>
            )}
          </div>

          <div className="post-editor-actions">
            <button
              className="button"
              type="submit"
              name="intent"
              value="save"
              disabled={pending || uploadBusy}
            >
              {primaryLabel}
            </button>
            {status !== "DRAFT" && (
              <button
                className="button-secondary"
                type="submit"
                name="intent"
                value="draft"
                disabled={pending || uploadBusy}
              >
                Salvar como rascunho
              </button>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>Classificação</legend>
          <div
            className={`admin-field ${fieldErrors.categoryId ? "has-error" : ""}`}
          >
            <label htmlFor="categoryId">Categoria</label>
            <select
              id="categoryId"
              name="categoryId"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                clearFieldError("categoryId");
              }}
              aria-invalid={Boolean(fieldErrors.categoryId)}
              aria-describedby={
                fieldErrors.categoryId ? "categoryId-error" : undefined
              }
            >
              <option value="">Sem categoria</option>
              {categories.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <FieldError field="categoryId" errors={fieldErrors} />
          </div>
          <div
            className={`admin-field ${fieldErrors.authorId ? "has-error" : ""}`}
          >
            <label htmlFor="authorId">Autor</label>
            <select
              id="authorId"
              name="authorId"
              value={authorId}
              onChange={(event) => {
                setAuthorId(event.target.value);
                clearFieldError("authorId");
              }}
              aria-invalid={Boolean(fieldErrors.authorId)}
              aria-describedby={
                fieldErrors.authorId ? "authorId-error" : undefined
              }
            >
              <option value="">Equipe Energy</option>
              {authors.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.displayName}
                </option>
              ))}
            </select>
            <FieldError field="authorId" errors={fieldErrors} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Imagem de capa</legend>
          <ImageUpload
            value={hasCover ? normalizedCoverUrl : ""}
            enabled={imageUploadsEnabled}
            onChange={(image) => {
              const nextUrl = image?.url ?? "";
              if (nextUrl !== coverUrl) setCoverAlt("");
              setCover(image);
              setCoverUrl(nextUrl);
              clearFieldError("coverImageUrl");
              if (!nextUrl) clearFieldError("coverImageAlt");
            }}
            onBusyChange={setUploadBusy}
          />
          <div
            className={`admin-field ${fieldErrors.coverImageUrl ? "has-error" : ""}`}
          >
            <label htmlFor="coverImageUrl">Ou cole a URL da imagem</label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              value={coverUrl}
              onChange={(event) => {
                const nextUrl = event.target.value;
                if (nextUrl !== coverUrl) setCoverAlt("");
                setCoverUrl(nextUrl);
                setCover(
                  nextUrl && isImageLocation(nextUrl)
                    ? { url: nextUrl, id: "", width: 1600, height: 900 }
                    : null,
                );
                clearFieldError("coverImageUrl");
                if (!nextUrl) clearFieldError("coverImageAlt");
              }}
              placeholder="https://exemplo.com/imagem.webp"
              aria-invalid={Boolean(fieldErrors.coverImageUrl)}
              aria-describedby={
                fieldErrors.coverImageUrl
                  ? "coverImageUrl-error"
                  : "coverImageUrl-help"
              }
            />
            <small id="coverImageUrl-help">
              Use uma imagem pública em HTTPS.
            </small>
            <FieldError field="coverImageUrl" errors={fieldErrors} />
          </div>
          <input type="hidden" name="coverImageId" value={cover?.id ?? ""} />
          <input
            type="hidden"
            name="coverImageWidth"
            value={cover?.width ?? ""}
          />
          <input
            type="hidden"
            name="coverImageHeight"
            value={cover?.height ?? ""}
          />
          <div
            className={`admin-field ${fieldErrors.coverImageAlt ? "has-error" : ""}`}
          >
            <label htmlFor="coverImageAlt">
              Texto alternativo{" "}
              {hasCover && (status === "PUBLISHED" || status === "SCHEDULED")
                ? "*"
                : ""}
            </label>
            <input
              id="coverImageAlt"
              name="coverImageAlt"
              value={coverAlt}
              onChange={(event) => {
                setCoverAlt(event.target.value);
                clearFieldError("coverImageAlt");
              }}
              maxLength={240}
              placeholder="Descreva o que aparece na imagem"
              aria-required={hasCover && isPublishableStatus}
              aria-invalid={Boolean(fieldErrors.coverImageAlt)}
              aria-describedby={
                fieldErrors.coverImageAlt
                  ? "coverImageAlt-error"
                  : "coverImageAlt-help"
              }
            />
            <small id="coverImageAlt-help">
              Ajuda pessoas que usam leitores de tela.
            </small>
            <FieldError field="coverImageAlt" errors={fieldErrors} />
          </div>
          <div
            className={`admin-field ${fieldErrors.coverImageCaption ? "has-error" : ""}`}
          >
            <label htmlFor="coverImageCaption">
              Legenda <span className="optional-label">opcional</span>
            </label>
            <input
              id="coverImageCaption"
              name="coverImageCaption"
              defaultValue={post?.coverImageCaption ?? ""}
              onChange={() => clearFieldError("coverImageCaption")}
              maxLength={300}
              aria-invalid={Boolean(fieldErrors.coverImageCaption)}
              aria-describedby={
                fieldErrors.coverImageCaption
                  ? "coverImageCaption-error"
                  : undefined
              }
            />
            <FieldError field="coverImageCaption" errors={fieldErrors} />
          </div>
        </fieldset>
      </aside>
    </form>
  );
}
