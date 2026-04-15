"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Search,
  Camera,
  Loader2,
  Check,
  X,
  Pencil,
  AlertCircle,
  Users,
} from "lucide-react";
import { updatePlayerCredential } from "@/app/admin/actions";

type PlayerData = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  photo: string | null;
};

type TeamData = {
  id: string;
  name: string;
  logoUrl: string | null;
  captain: { name: string; email: string; phone: string | null };
  tournamentName: string | null;
  players: PlayerData[];
};

const POSITIONS = ["Portero", "Defensa", "Medio", "Delantero"];

export function CredencialesPanel({ teams }: { teams: TeamData[] }) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const filteredTeams = teams
    .map((team) => ({
      ...team,
      players: team.players.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(
      (team) =>
        (selectedTeam === "all" || team.id === selectedTeam) &&
        team.players.length > 0
    );

  const allPlayers = filteredTeams.flatMap((t) =>
    t.players.map((p) => ({ ...p, teamName: t.name, teamLogoUrl: t.logoUrl, tournamentName: t.tournamentName }))
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            className="pl-9"
          />
        </div>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="h-10 border rounded-md px-3 text-sm bg-background min-w-[160px]"
        >
          <option value="all">Todos los equipos</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="shrink-0"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir todo
        </Button>
      </div>

      {/* Missing photos warning */}
      {allPlayers.some((p) => !p.photo) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Jugadores sin foto</p>
            <p className="text-amber-700 mt-0.5">
              {allPlayers.filter((p) => !p.photo).length} jugadores aun no tienen foto de credencial.
              Los capitanes pueden subirlas desde su portal.
            </p>
          </div>
        </div>
      )}

      {/* Teams list */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No se encontraron resultados</p>
        </div>
      ) : (
        filteredTeams.map((team) => (
          <TeamSection key={team.id} team={team} />
        ))
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: fixed; inset: 0; }
          .no-print { display: none !important; }
          .credential-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

function TeamSection({ team }: { team: TeamData }) {
  const withPhoto = team.players.filter((p) => p.photo).length;

  return (
    <div className="space-y-4 print-area">
      {/* Team header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          {team.logoUrl && (
            <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-[#f0f0f0]">
              <Image src={team.logoUrl} alt={team.name} fill className="object-contain" />
            </div>
          )}
          <div>
            <h2 className="font-display text-xl uppercase tracking-tight">{team.name}</h2>
            <p className="text-xs text-muted-foreground">
              Cap: {team.captain.name} · {withPhoto}/{team.players.length} con foto
              {team.tournamentName && ` · ${team.tournamentName}`}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Isolate this team's section for printing
            const allSections = document.querySelectorAll(".print-area");
            allSections.forEach((s) => s.classList.remove("print-area"));
            const thisSection = document.getElementById(`team-${team.id}`);
            thisSection?.classList.add("print-area");
            window.print();
            thisSection?.classList.remove("print-area");
            allSections.forEach((s) => s.classList.add("print-area"));
          }}
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Imprimir equipo
        </Button>
      </div>

      {/* Cards grid */}
      <div id={`team-${team.id}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {team.players.map((player) => (
          <CredentialCard
            key={player.id}
            player={player}
            teamName={team.name}
            teamLogoUrl={team.logoUrl}
            tournamentName={team.tournamentName}
          />
        ))}
      </div>
    </div>
  );
}

function CredentialCard({
  player,
  teamName,
  teamLogoUrl,
  tournamentName,
}: {
  player: PlayerData;
  teamName: string;
  teamLogoUrl: string | null;
  tournamentName: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(player.photo);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch("/api/upload-player-photo", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentPhoto(data.url);
      startTransition(() => updatePlayerCredential(player.id, { photo: data.url }));
    } catch (e: any) {
      alert(e.message || "Error al subir la foto");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (editing) {
    return (
      <EditCard
        player={{ ...player, photo: currentPhoto }}
        teamName={teamName}
        onSave={(data) => {
          startTransition(async () => {
            await updatePlayerCredential(player.id, {
              name: data.name,
              number: data.number,
              position: data.position,
            });
            setEditing(false);
          });
        }}
        onCancel={() => setEditing(false)}
        pending={pending}
      />
    );
  }

  return (
    <div className="credential-card rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
      {/* Photo area */}
      <div className="relative aspect-[3/4] bg-[#f0f0f0]">
        {currentPhoto ? (
          <Image src={currentPhoto} alt={player.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-full bg-[#e0e0e0] flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">Sin foto</span>
          </div>
        )}

        {/* Photo upload overlay */}
        <button
          type="button"
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 no-print"
          onClick={() => inputRef.current?.click()}
        >
          {uploadingPhoto ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <>
              <Camera className="h-5 w-5 text-white" />
              <span className="text-[10px] text-white font-medium">Cambiar foto</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhotoUpload(file);
            e.target.value = "";
          }}
        />

        {/* Number badge */}
        {player.number && (
          <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-[10px] font-bold">
            {player.number}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        {/* Team logo + name row */}
        <div className="flex items-center gap-1 mb-1">
          {teamLogoUrl && (
            <div className="relative h-4 w-4 shrink-0">
              <Image src={teamLogoUrl} alt={teamName} fill className="object-contain" />
            </div>
          )}
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">
            {teamName}
          </span>
        </div>

        <p className="text-xs font-bold leading-tight truncate">{player.name}</p>
        {player.position && (
          <p className="text-[10px] text-muted-foreground">{player.position}</p>
        )}
        {tournamentName && (
          <p className="text-[9px] text-muted-foreground/60 truncate mt-0.5">{tournamentName}</p>
        )}
      </div>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print"
      >
        <Pencil className="h-3 w-3 text-foreground" />
      </button>
    </div>
  );
}

function EditCard({
  player,
  teamName,
  onSave,
  onCancel,
  pending,
}: {
  player: PlayerData & { photo: string | null };
  teamName: string;
  onSave: (data: { name?: string; number?: number | null; position?: string | null }) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [name, setName] = useState(player.name);
  const [number, setNumber] = useState(player.number?.toString() ?? "");
  const [position, setPosition] = useState(player.position ?? "");

  return (
    <div className="credential-card rounded-xl border-2 border-emerald-500 bg-white overflow-hidden shadow-sm p-3 space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700">
        Editando — {teamName}
      </p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre"
        className="h-7 text-xs"
      />
      <Input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="# Dorsal"
        min="1"
        max="99"
        className="h-7 text-xs"
      />
      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="w-full h-7 text-xs border rounded-md px-2 bg-background"
      >
        <option value="">Posicion</option>
        {POSITIONS.map((pos) => (
          <option key={pos} value={pos}>
            {pos}
          </option>
        ))}
      </select>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="flex-1 h-7 text-xs"
          disabled={pending}
          onClick={() =>
            onSave({
              name,
              number: number ? parseInt(number) : null,
              position: position || null,
            })
          }
        >
          <Check className="h-3 w-3 mr-1" />
          Guardar
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
