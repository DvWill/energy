"use client";
import { useRef, useState } from "react";
import Image from "next/image";
export type UploadedImage = { url: string; id: string; width: number; height: number };
export function ImageUpload({ value, onChange }: { value: string; onChange: (image: UploadedImage | null) => void }) {
  const input = useRef<HTMLInputElement>(null), [progress,setProgress] = useState(0), [error,setError] = useState(""), [busy,setBusy] = useState(false);
  const upload = (file?: File) => { if (!file) return; setError(""); setBusy(true); const data = new FormData(); data.append("file", file); const xhr = new XMLHttpRequest(); xhr.open("POST","/api/admin/uploads"); xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round(e.loaded/e.total*100)); xhr.onload = () => { setBusy(false); if (xhr.status >= 200 && xhr.status < 300) { const result = JSON.parse(xhr.responseText) as UploadedImage; onChange(result); } else { try { setError(JSON.parse(xhr.responseText).message); } catch { setError("Falha no upload."); } } }; xhr.onerror = () => { setBusy(false); setError("Falha de conexão."); }; xhr.send(data); };
  return <div className="image-upload">{value && <div className="image-preview"><Image src={value} alt="Prévia da imagem enviada" fill sizes="320px" /></div>}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => upload(e.target.files?.[0])} /><button type="button" onClick={() => input.current?.click()} disabled={busy}>{busy ? `Enviando ${progress}%` : value ? "Substituir imagem" : "Enviar imagem"}</button>{value && <button type="button" onClick={() => onChange(null)}>Remover</button>}{busy && <progress value={progress} max={100}>{progress}%</progress>}{error && <p role="alert">{error}</p>}</div>;
}
