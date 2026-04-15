"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X, Camera, Loader2 } from "lucide-react";
import {
  addPlayer,
  updatePlayer,
  removePlayer,
  updatePlayerPhoto,
} from "@/app/(auth)/mi-equipo/actions";

type Player = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  photo: string | null;
};

const POSITIONS = ["Portero", "Defensa", "Medio", "Delantero"];

export function RosterEditor({
  players,
  playerStats,
}: {
  players: Player[];
  playerStats: Record<string, { goals: number; yellowCards: number; redCards: number }>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {players.map((p) => {
        if (editingId === p.id) {
          return (
            <PlayerForm
              key={p.id}
              player={p}
              pending={pending}
              onSave={(formData) => {
                startTransition(async () => {
                  await updatePlayer(p.id, formData);
                  setEditingId(null);
                });
              }}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        const stats = playerStats[p.id];
        return (
          <div
            key={p.id}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f5f5f5] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              {/* Photo avatar */}
              <PhotoUpload playerId={p.id} currentPhoto={p.photo} playerName={p.name} />

              <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                {p.number ?? "—"}
              </span>
              <div>
                <span className="text-sm font-medium">{p.name}</span>
                {p.position && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground uppercase">
                    {p.position}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Stats (read-only) */}
              <div className="flex items-center gap-2 text-xs mr-2">
                {stats?.goals ? (
                  <span className="text-muted-foreground">{stats.goals}g</span>
                ) : null}
                {stats?.yellowCards ? (
                  <span className="flex items-center gap-0.5">
                    <span className="inline-block w-2 h-2.5 bg-amber-400 rounded-[1px]" />
                    {stats.yellowCards}
                  </span>
                ) : null}
                {stats?.redCards ? (
                  <span className="flex items-center gap-0.5">
                    <span className="inline-block w-2 h-2.5 bg-red-500 rounded-[1px]" />
                    {stats.redCards}
                  </span>
                ) : null}
              </div>
              {/* Actions */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingId(p.id)}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Eliminar a ${p.name}?`)) {
                    startTransition(() => removePlayer(p.id));
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Add player */}
      {adding ? (
        <PlayerForm
          pending={pending}
          onSave={(formData) => {
            startTransition(async () => {
              await addPlayer(formData);
              setAdding(false);
            });
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar Jugador
        </Button>
      )}
    </div>
  );
}

// ─── Photo Upload Avatar ───────────────────────────────────

function PhotoUpload({
  playerId,
  currentPhoto,
  playerName,
}: {
  playerId: string;
  currentPhoto: string | null;
  playerName: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch("/api/upload-player-photo", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.url);
      startTransition(() => updatePlayerPhoto(playerId, data.url));
    } catch (e: any) {
      alert(e.message || "Error al subir la foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <button
      type="button"
      className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#e8e8e8] flex items-center justify-center group/photo"
      title="Subir foto del jugador"
      onClick={() => inputRef.current?.click()}
    >
      {uploading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : preview ? (
        <>
          <Image src={preview} alt={playerName} fill className="object-cover" />
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-3 w-3 text-white" />
          </span>
        </>
      ) : (
        <>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {playerName.charAt(0)}
          </span>
          <span className="absolute inset-0 bg-black/10 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-3 w-3 text-foreground" />
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}

// ─── Player Form ───────────────────────────────────────────

function PlayerForm({
  player,
  pending,
  onSave,
  onCancel,
}: {
  player?: Player;
  pending: boolean;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-[#f5f5f5]"
      action={(formData) => onSave(formData)}
    >
      <Input
        name="number"
        type="number"
        min="1"
        max="99"
        defaultValue={player?.number ?? ""}
        placeholder="#"
        className="w-14 h-8 text-xs text-center"
      />
      <Input
        name="name"
        defaultValue={player?.name ?? ""}
        placeholder="Nombre del jugador"
        required
        className="flex-1 min-w-[140px] h-8 text-xs"
      />
      <select
        name="position"
        defaultValue={player?.position ?? ""}
        className="h-8 text-xs border rounded-md px-2 bg-background"
      >
        <option value="">Posicion</option>
        {POSITIONS.map((pos) => (
          <option key={pos} value={pos}>
            {pos}
          </option>
        ))}
      </select>
      <Button type="submit" size="icon-sm" disabled={pending}>
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
