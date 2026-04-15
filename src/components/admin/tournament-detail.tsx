"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Zap,
  UserPlus,
  UserMinus,
  Check,
  X,
  Trophy,
  Minus,
  Star,
  Users,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  generateFixtures,
  enrollTeam,
  unenrollTeam,
  recordResult,
  clearResult,
  createTeam,
  addMatchEvent,
  removeMatchEvent,
  registerMatchParticipants,
  setMatchAsFinal,
  checkFinalsEligibility,
} from "@/app/admin/actions";

// ─── Generate Fixtures Button ──────────────────────────────

export function GenerateFixturesButton({
  tournamentId,
  teamCount,
}: {
  tournamentId: string;
  teamCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        disabled={pending || teamCount < 2}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await generateFixtures(tournamentId);
            } catch (e: any) {
              setError(e.message);
            }
          });
        }}
        className="bg-emerald-600 hover:bg-emerald-500"
      >
        <Zap className="h-4 w-4 mr-2" />
        {pending ? "Generando..." : "Generar Fixtures"}
      </Button>
      {teamCount < 2 && (
        <p className="text-xs text-muted-foreground mt-1">
          Se necesitan al menos 2 equipos
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ─── Enroll Team ────────────────────────────────────────────

export function EnrollTeamButton({
  tournamentId,
  availableTeams,
}: {
  tournamentId: string;
  availableTeams: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UserPlus className="h-4 w-4 mr-2" />
        Inscribir Equipo
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inscribir Equipo</DialogTitle>
        </DialogHeader>
        {availableTeams.length === 0 ? (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              No hay equipos disponibles. Crea uno primero.
            </p>
            <CreateTeamInline
              onCreated={() => setOpen(false)}
              tournamentId={tournamentId}
            />
          </div>
        ) : (
          <div className="space-y-2 py-4 max-h-60 overflow-y-auto">
            {availableTeams.map((team) => (
              <button
                key={team.id}
                disabled={pending}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#fafafa] transition-colors text-left"
                onClick={() => {
                  startTransition(async () => {
                    await enrollTeam(tournamentId, team.id);
                    setOpen(false);
                  });
                }}
              >
                <span className="font-medium text-sm">{team.name}</span>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateTeamInline({
  onCreated,
  tournamentId,
}: {
  onCreated: () => void;
  tournamentId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await createTeam(formData);
          onCreated();
        });
      }}
      className="space-y-3 p-3 rounded-lg bg-[#fafafa]"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Crear equipo nuevo
      </p>
      <Input name="teamName" required placeholder="Nombre del equipo" />
      <Input name="captainName" required placeholder="Nombre del capitan" />
      <Input name="captainEmail" type="email" required placeholder="Email del capitan" />
      <Input name="captainPhone" placeholder="Telefono (opcional)" />
      <input type="hidden" name="captainPassword" value="equipo123" />
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Creando..." : "Crear Equipo"}
      </Button>
    </form>
  );
}

// ─── Unenroll Team Button ───────────────────────────────────

export function UnenrollTeamButton({
  tournamentId,
  teamId,
}: {
  tournamentId: string;
  teamId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      className="text-muted-foreground hover:text-red-600"
      onClick={() => {
        startTransition(() => unenrollTeam(tournamentId, teamId));
      }}
    >
      <UserMinus className="h-4 w-4" />
    </Button>
  );
}

// ─── Record Match Result ────────────────────────────────────

type MatchPlayer = { id: string; name: string; number: number | null };
type MatchEventData = {
  id: string;
  type: string;
  minute: number | null;
  playerId: string;
  teamId: string;
  player: { name: string };
};
type MatchParticipantData = { playerId: string; teamId: string };

export function MatchResultRow({
  match,
  tournamentId,
}: {
  match: {
    id: string;
    matchDay: number;
    homeTeam: { id: string; name: string; players: MatchPlayer[] };
    awayTeam: { id: string; name: string; players: MatchPlayer[] };
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    isFinal: boolean;
    events: MatchEventData[];
    participants: MatchParticipantData[];
  };
  tournamentId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showLineup, setShowLineup] = useState(false);
  const [pending, startTransition] = useTransition();

  const isPlayed = match.status === "PLAYED" || match.status === "DEFAULTED" || match.status === "ABANDONED";

  const eventIcons: Record<string, string> = {
    GOAL: "⚽",
    OWN_GOAL: "⚽🔴",
    YELLOW_CARD: "🟨",
    RED_CARD: "🟥",
    SANCTION: "⛔",
  };

  if (editing) {
    return (
      <tr className="border-b">
        <td className="p-3 text-sm text-center text-muted-foreground">J{match.matchDay}</td>
        <td className="p-3 text-sm text-right font-medium">{match.homeTeam.name}</td>
        <td className="p-3">
          <form
            className="flex items-center justify-center gap-1"
            action={(formData) => {
              startTransition(async () => {
                await recordResult(match.id, formData);
                setEditing(false);
              });
            }}
          >
            <Input
              name="homeScore"
              type="number"
              min="0"
              defaultValue={match.homeScore ?? ""}
              className="w-12 text-center h-8"
              required
            />
            <Minus className="h-3 w-3 text-muted-foreground" />
            <Input
              name="awayScore"
              type="number"
              min="0"
              defaultValue={match.awayScore ?? ""}
              className="w-12 text-center h-8"
              required
            />
            <Button type="submit" size="icon-sm" disabled={pending} className="ml-1">
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </form>
        </td>
        <td className="p-3 text-sm font-medium">{match.awayTeam.name}</td>
        <td className="p-3 text-center" />
      </tr>
    );
  }

  return (
    <>
      <tr className={`border-b hover:bg-[#fafafa] transition-colors ${match.isFinal ? "bg-amber-50/50" : ""}`}>
        <td className="p-3 text-sm text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-0.5">
            <span>J{match.matchDay}</span>
            {match.isFinal && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-1 rounded">
                Final
              </span>
            )}
          </div>
        </td>
        <td className="p-3 text-sm text-right font-medium">{match.homeTeam.name}</td>
        <td className="p-3 text-center">
          {isPlayed ? (
            <span className="font-bold text-sm">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">vs</span>
          )}
        </td>
        <td className="p-3 text-sm font-medium">{match.awayTeam.name}</td>
        <td className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(true)}
              title="Registrar resultado"
            >
              <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {/* Mark as final */}
            <Button
              variant="ghost"
              size="icon-sm"
              title={match.isFinal ? "Quitar marca de Final" : "Marcar como Final"}
              className={match.isFinal ? "text-amber-500" : "text-muted-foreground"}
              disabled={pending}
              onClick={() => {
                startTransition(() => setMatchAsFinal(match.id, !match.isFinal));
              }}
            >
              <Star className="h-3.5 w-3.5" />
            </Button>
            {/* Lineup */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { setShowLineup(!showLineup); setShowEvents(false); }}
              title="Registrar alineacion"
              className={showLineup ? "bg-muted" : ""}
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {isPlayed && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => { setShowEvents(!showEvents); setShowLineup(false); }}
                  title="Eventos del partido"
                  className={showEvents ? "bg-muted" : ""}
                >
                  <span className="text-xs">⚽</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-red-600"
                  onClick={() => {
                    startTransition(() => clearResult(match.id));
                  }}
                  title="Borrar resultado"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>
      {/* Events inline */}
      {isPlayed && match.events.length > 0 && !showEvents && !showLineup && (
        <tr className="border-b">
          <td colSpan={5} className="px-3 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {match.events.map((e) => (
                <span key={e.id} className="text-[10px] text-muted-foreground">
                  {eventIcons[e.type] ?? "?"} {e.player.name}
                  {e.minute ? ` ${e.minute}'` : ""}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
      {/* Events editor */}
      {showEvents && (
        <tr className="border-b bg-[#fafafa]">
          <td colSpan={5} className="p-3">
            <MatchEventsEditor match={match} onClose={() => setShowEvents(false)} />
          </td>
        </tr>
      )}
      {/* Lineup editor */}
      {showLineup && (
        <tr className="border-b bg-blue-50/40">
          <td colSpan={5} className="p-3">
            <LineupEditor
              match={match}
              tournamentId={tournamentId}
              onClose={() => setShowLineup(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function MatchEventsEditor({
  match,
  onClose,
}: {
  match: {
    id: string;
    homeTeam: { id: string; name: string; players: MatchPlayer[] };
    awayTeam: { id: string; name: string; players: MatchPlayer[] };
    events: MatchEventData[];
  };
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const eventIcons: Record<string, string> = {
    GOAL: "⚽ Gol",
    OWN_GOAL: "⚽🔴 Autogol",
    YELLOW_CARD: "🟨 Amarilla",
    RED_CARD: "🟥 Roja",
    SANCTION: "⛔ Sancion",
  };

  const allPlayers = [
    ...match.homeTeam.players.map((p) => ({ ...p, teamId: match.homeTeam.id, teamName: match.homeTeam.name })),
    ...match.awayTeam.players.map((p) => ({ ...p, teamId: match.awayTeam.id, teamName: match.awayTeam.name })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Eventos del partido
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onClose}
        >
          <Check className="h-3 w-3 mr-1" />
          Listo
        </Button>
      </div>

      {/* Existing events */}
      {match.events.length > 0 && (
        <div className="space-y-1">
          {match.events.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-background">
              <span>
                {eventIcons[e.type] ?? e.type} — {e.player.name}
                {e.minute ? ` (${e.minute}')` : ""}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-5 w-5 text-muted-foreground hover:text-red-600"
                disabled={pending}
                onClick={() => {
                  startTransition(() => removeMatchEvent(e.id));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add event form */}
      {allPlayers.length > 0 ? (
        <form
          className="flex flex-wrap items-end gap-2"
          action={(formData) => {
            startTransition(async () => {
              const playerId = formData.get("playerId") as string;
              const player = allPlayers.find((p) => p.id === playerId);
              if (!player) return;
              await addMatchEvent(
                match.id,
                playerId,
                player.teamId,
                formData.get("type") as string,
                formData.get("minute") ? parseInt(formData.get("minute") as string) : undefined,
              );
            });
          }}
        >
          <select name="playerId" required className="text-xs border rounded px-2 py-1.5 bg-background">
            <option value="">Jugador...</option>
            <optgroup label={match.homeTeam.name}>
              {match.homeTeam.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number ? `#${p.number} ` : ""}{p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={match.awayTeam.name}>
              {match.awayTeam.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number ? `#${p.number} ` : ""}{p.name}
                </option>
              ))}
            </optgroup>
          </select>
          <select name="type" required className="text-xs border rounded px-2 py-1.5 bg-background">
            <option value="GOAL">⚽ Gol</option>
            <option value="OWN_GOAL">⚽🔴 Autogol</option>
            <option value="YELLOW_CARD">🟨 Amarilla</option>
            <option value="RED_CARD">🟥 Roja</option>
            <option value="SANCTION">⛔ Sancion</option>
          </select>
          <Input name="minute" type="number" min="0" max="120" placeholder="Min" className="w-16 h-7 text-xs" />
          <Button type="submit" size="sm" disabled={pending} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500">
            {pending ? "..." : "+ Agregar"}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">
          Registra jugadores en los equipos para poder agregar eventos.
        </p>
      )}
    </div>
  );
}

// ─── Lineup Editor ─────────────────────────────────────────

function LineupEditor({
  match,
  tournamentId,
  onClose,
}: {
  match: {
    id: string;
    isFinal: boolean;
    homeTeam: { id: string; name: string; players: MatchPlayer[] };
    awayTeam: { id: string; name: string; players: MatchPlayer[] };
    participants: MatchParticipantData[];
  };
  tournamentId: string;
  onClose: () => void;
}) {
  const existingHome = new Set(
    match.participants.filter((p) => p.teamId === match.homeTeam.id).map((p) => p.playerId)
  );
  const existingAway = new Set(
    match.participants.filter((p) => p.teamId === match.awayTeam.id).map((p) => p.playerId)
  );

  const [homeSelected, setHomeSelected] = useState<Set<string>>(existingHome);
  const [awaySelected, setAwaySelected] = useState<Set<string>>(existingAway);
  const [pending, startTransition] = useTransition();
  const [eligibility, setEligibility] = useState<{
    homeTeam: { name: string; eligible: boolean; percent: number; missing: string[] };
    awayTeam: { name: string; eligible: boolean; percent: number; missing: string[] };
  } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  function toggle(set: Set<string>, id: string): Set<string> {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  async function handleCheckEligibility() {
    setCheckingEligibility(true);
    try {
      const result = await checkFinalsEligibility(tournamentId, match.id);
      setEligibility(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCheckingEligibility(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      await registerMatchParticipants(
        match.id,
        Array.from(homeSelected),
        Array.from(awaySelected)
      );
      onClose();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Alineacion del partido
        </div>
        <div className="flex items-center gap-2">
          {match.isFinal && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={checkingEligibility || match.participants.length === 0}
              onClick={handleCheckEligibility}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {checkingEligibility ? "Verificando..." : "Verificar regla 80%"}
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-xs bg-blue-600 hover:bg-blue-500"
            disabled={pending}
            onClick={handleSave}
          >
            <Check className="h-3 w-3 mr-1" />
            Guardar alineacion
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Eligibility result */}
      {eligibility && (
        <div className="grid grid-cols-2 gap-3">
          {[eligibility.homeTeam, eligibility.awayTeam].map((team) => (
            <div
              key={team.name}
              className={`rounded-lg p-3 border ${
                team.eligible
                  ? "bg-emerald-50 border-emerald-200"
                  : team.percent === 0
                  ? "bg-gray-50 border-gray-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {team.eligible ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs font-bold">{team.name}</span>
              </div>
              <p className={`text-sm font-bold ${team.eligible ? "text-emerald-700" : "text-red-700"}`}>
                {team.percent === 0 ? "Sin alineacion registrada" : `${team.percent}% elegibles`}
              </p>
              {!team.eligible && team.missing.length > 0 && (
                <p className="text-[10px] text-red-600 mt-1">
                  No elegibles: {team.missing.join(", ")}
                </p>
              )}
              {team.eligible && (
                <p className="text-[10px] text-emerald-600 mt-0.5">Cumple regla del 80%</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Player checkboxes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium mb-2">{match.homeTeam.name}</p>
          <div className="space-y-1">
            {match.homeTeam.players.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin jugadores registrados</p>
            ) : (
              match.homeTeam.players.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={homeSelected.has(p.id)}
                    onChange={() => setHomeSelected(toggle(homeSelected, p.id))}
                    className="rounded"
                  />
                  <span>
                    {p.number ? <span className="text-muted-foreground mr-1">#{p.number}</span> : null}
                    {p.name}
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {homeSelected.size} seleccionados
          </p>
        </div>
        <div>
          <p className="text-xs font-medium mb-2">{match.awayTeam.name}</p>
          <div className="space-y-1">
            {match.awayTeam.players.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin jugadores registrados</p>
            ) : (
              match.awayTeam.players.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={awaySelected.has(p.id)}
                    onChange={() => setAwaySelected(toggle(awaySelected, p.id))}
                    className="rounded"
                  />
                  <span>
                    {p.number ? <span className="text-muted-foreground mr-1">#{p.number}</span> : null}
                    {p.name}
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {awaySelected.size} seleccionados
          </p>
        </div>
      </div>

      {match.isFinal && match.participants.length === 0 && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          Este es un partido de Final. Registra la alineacion y luego verifica la regla del 80% para
          asegurar que ambos equipos cumplen con los jugadores de temporada.
        </p>
      )}
    </div>
  );
}

// ─── Standings Table ────────────────────────────────────────

export function StandingsTable({
  standings,
}: {
  standings: {
    team: { name: string };
    points: number;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Equipo</th>
            <th className="p-3 text-center">PJ</th>
            <th className="p-3 text-center">G</th>
            <th className="p-3 text-center">E</th>
            <th className="p-3 text-center">P</th>
            <th className="p-3 text-center">GF</th>
            <th className="p-3 text-center">GC</th>
            <th className="p-3 text-center">DG</th>
            <th className="p-3 text-center font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={i} className="border-b hover:bg-[#fafafa] transition-colors">
              <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
              <td className="p-3 font-medium">{s.team.name}</td>
              <td className="p-3 text-center">{s.gamesPlayed}</td>
              <td className="p-3 text-center text-emerald-600">{s.wins}</td>
              <td className="p-3 text-center text-amber-600">{s.draws}</td>
              <td className="p-3 text-center text-red-600">{s.losses}</td>
              <td className="p-3 text-center">{s.goalsFor}</td>
              <td className="p-3 text-center">{s.goalsAgainst}</td>
              <td className="p-3 text-center">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
              <td className="p-3 text-center font-bold text-lg">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
