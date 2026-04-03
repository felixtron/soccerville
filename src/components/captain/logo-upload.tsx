"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { updateTeamLogo } from "@/app/(auth)/mi-equipo/actions";

export function LogoUpload({
  currentUrl,
  teamName,
}: {
  currentUrl: string | null;
  teamName: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = teamName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("Maximo 2MB");
      return;
    }

    setError(null);
    setUploading(true);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al subir");
        setPreview(currentUrl);
        return;
      }

      // Save URL to team
      startTransition(async () => {
        await updateTeamLogo(data.url);
      });
    } catch {
      setError("Error de conexion");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading || pending}
        className="relative group"
      >
        {/* Logo circle */}
        <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
          {preview ? (
            <Image
              src={preview}
              alt={teamName}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-white/40">{initials}</span>
            </div>
          )}
        </div>
        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
        {(uploading || pending) && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-white/30">
        {uploading ? "Subiendo..." : "Toca para cambiar logo"}
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
