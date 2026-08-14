"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type UploadedImage = {
  url: string;
  id: string;
  width: number;
  height: number;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function ImageUpload({
  value,
  onChange,
  onBusyChange,
  enabled = true,
}: {
  value: string;
  onChange: (image: UploadedImage | null) => void;
  onBusyChange?: (busy: boolean) => void;
  enabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const changeBusy = (nextBusy: boolean) => {
    setBusy(nextBusy);
    onBusyChange?.(nextBusy);
  };

  const finish = () => {
    changeBusy(false);
    if (input.current) input.current.value = "";
  };

  const upload = (file?: File) => {
    if (!file) return;
    setError("");
    setProgress(0);

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Escolha uma imagem JPG, PNG, WEBP ou AVIF.");
      if (input.current) input.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no máximo 8 MB.");
      if (input.current) input.current.value = "";
      return;
    }

    changeBusy(true);
    const data = new FormData();
    data.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/uploads");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText) as UploadedImage;
        onChange(result);
        setProgress(100);
      } else {
        try {
          setError(JSON.parse(xhr.responseText).message);
        } catch {
          setError("Não foi possível enviar a imagem.");
        }
      }
      finish();
    };
    xhr.onerror = () => {
      setError("Falha de conexão durante o envio da imagem.");
      finish();
    };
    xhr.onabort = () => {
      setError("O envio da imagem foi cancelado.");
      finish();
    };
    xhr.send(data);
  };

  return (
    <div className="image-upload">
      {value && (
        <div className="image-preview">
          <Image
            src={value}
            alt="Prévia da imagem enviada"
            fill
            sizes="320px"
          />
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(event) => upload(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy || !enabled}
      >
        {!enabled
          ? "Envio direto indisponível"
          : busy
            ? `Enviando ${progress}%`
            : value
              ? "Substituir imagem"
              : "Enviar imagem"}
      </button>
      {value && !busy && (
        <button type="button" onClick={() => onChange(null)}>
          Remover
        </button>
      )}
      <small
        className={`image-upload-help ${!enabled ? "upload-config-warning" : ""}`}
      >
        {enabled
          ? "JPG, PNG, WEBP ou AVIF, até 8 MB."
          : "O serviço de upload ainda não está configurado. Cole abaixo a URL HTTPS de uma imagem já publicada."}
      </small>
      {busy && (
        <progress aria-label="Progresso do envio" value={progress} max={100}>
          {progress}%
        </progress>
      )}
      <span className="sr-only" aria-live="polite">
        {busy ? `Enviando imagem: ${progress}%` : ""}
      </span>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
