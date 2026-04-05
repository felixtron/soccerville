"use client";

import { useState, useMemo, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Trophy,
  Users,
  Check,
  X,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  recordResult,
  clearResult,
  addMatchEvent,
  removeMatchEvent,
} from "@/app/admin/actions";
import { StandingsTable } from "./tournament-detail";

// ─── Types ─────────────────────────────────────────────────

type Player = { id: string; name: string; number: number | null };
type MatchEvent = {
  id: string;
  type: string;
  minute: number | null;
  playerId: string;
  teamId: string;
  player: { name: string };
};
type Match = {
  id: string;
  matchDay: number;
  homeTeam: { id: string; name: string; players: Player[] };
  awayTeam: { id: string; name: string; players: Player[] };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  events: MatchEvent[];
};
type Team = {
  id: string;
  name: string;
  captainName: string;
  inscriptionPaid: boolean;
};
type Standing = {
  team: { name: string };
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

const statusColors: Record<string, string> = {
  PLAYED: "bg-emerald-500 text-white",
  DEFAULTED: "bg-orange-500 text-white",
  ABANDONED: "bg-purple-500 text-white",
  CANCELLED: "bg-red-400 text-white",
  SCHEDULED: "bg-gray-100 text-gray-600 border border-gray-200",
};

const eventIcons: Record<string, string> = {
  GOAL: "⚽",
  OWN_GOAL: "⚽🔴",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
  SANCTION: "⛔",
};

// ─── Main Dashboard ────────────────────────────────────────

export function TournamentDashboard({
  matches,
  teams,
  standings,
  tournamentId,
  hasMatches,
  teamCount,
}: {
  matches: Match[];
  teams: Team[];
  standings: Standing[];
  tournamentId: string;
  hasMatches: boolean;
  teamCount: number;
}) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const played = matches.filter(
    (m) => m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED"
  ).length;
  const pct = matches.length > 0 ? Math.round((played / matches.length) * 100) : 0;

  const byDay = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of matches) {
      if (!map.has(m.matchDay)) map.set(m.matchDay, []);
      map.get(m.matchDay)!.push(m);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [matches]);

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) ?? null
    : null;

  return (
    <Tabs defaultValue={hasMatches ? "partidos" : "equipos"}>
      <TabsList variant="line" className="mb-4">
        <TabsTrigger value="partidos" className="gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5" /> Partidos
          {hasMatches && (
            <span className="text-[10px] text-muted-foreground ml-1">{played}/{matches.length}</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="posiciones" className="gap-1.5 text-xs">
          <Trophy className="h-3.5 w-3.5" /> Posiciones
        </TabsTrigger>
        <TabsTrigger value="equipos" className="gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5" /> Equipos
          <span className="text-[10px] text-muted-foreground ml-1">{teamCount}</span>
        </TabsTrigger>
      </TabsList>

      {/* ─── Partidos Tab ─────────────────────────── */}
      <TabsContent value="partidos">
        {!hasMatches ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No hay partidos generados</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {teamCount < 2
                  ? "Inscribe al menos 2 equipos para generar fixtures"
                  : "Click en 'Generar Fixtures' para crear el calendario"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
            </div>

            {/* Match detail panel (when selected) */}
            {selectedMatch && (
              <MatchDetailPanel
                match={selectedMatch}
                onClose={() => setSelectedMatchId(null)}
              />
            )}

            {/* Jornadas grid */}
            {byDay.map(([day, dayMatches]) => {
              const dayPlayed = dayMatches.filter(
                (m) => m.status === "PLAYED" || m.status === "DEFAULTED"
              ).length;
              const isComplete = dayPlayed === dayMatches.length;
              return (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-5 w-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-bold">
                      {day}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Jornada {day}</span>
                    {isComplete && <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Completa</Badge>}
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                    {dayMatches.map((m) => {
                      const isPlayed = m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED";
                      const isSelected = m.id === selectedMatchId;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMatchId(isSelected ? null : m.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all text-xs ${
                            isSelected
                              ? "ring-2 ring-blue-500 bg-blue-50"
                              : isPlayed
                              ? "bg-white shadow-sm hover:shadow-md"
                              : "bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-medium truncate max-w-[70px]">{m.homeTeam.name}</span>
                            {isPlayed ? (
                              <span className="font-bold text-sm shrink-0">{m.homeScore}-{m.awayScore}</span>
                            ) : (
                              <span className="text-muted-foreground shrink-0">vs</span>
                            )}
                            <span className="font-medium truncate max-w-[70px]">{m.awayTeam.name}</span>
                          </div>
                          {isPlayed && m.events.length > 0 && (
                            <span className="text-[9px] text-muted-foreground ml-1 shrink-0">
                              {m.events.length}ev
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-white shadow-sm border" />
                <span className="text-[10px] text-muted-foreground">Jugado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-gray-100 border border-dashed border-gray-300" />
                <span className="text-[10px] text-muted-foreground">Pendiente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm ring-2 ring-blue-500 bg-blue-50" />
                <span className="text-[10px] text-muted-foreground">Seleccionado</span>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      {/* ─── Posiciones Tab ───────────────────────── */}
      <TabsContent value="posiciones">
        {standings.length > 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <StandingsTable standings={standings} />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No hay posiciones aun</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ─── Equipos Tab ─────────────────────────── */}
      <TabsContent value="equipos">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {teams.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Cap: {t.captainName}</p>
                    </div>
                  </div>
                  {t.inscriptionPaid && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Pagado</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ─── Match Detail Panel ────────────────────────────────────

function MatchDetailPanel({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const isPlayed = match.status === "PLAYED" || match.status === "DEFAULTED" || match.status === "ABANDONED";

  const allPlayers = [
    ...match.homeTeam.players.map((p) => ({ ...p, teamId: match.homeTeam.id })),
    ...match.awayTeam.players.map((p) => ({ ...p, teamId: match.awayTeam.id })),
  ];

  return (
    <Card className="border-0 shadow-md ring-1 ring-blue-200 bg-white">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[10px]">Jornada {match.matchDay}</Badge>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-right flex-1">
            <p className="font-bold text-sm">{match.homeTeam.name}</p>
          </div>

          {editing ? (
            <form
              className="flex items-center gap-1"
              action={(formData) => {
                startTransition(async () => {
                  await recordResult(match.id, formData);
                  setEditing(false);
                });
              }}
            >
              <Input name="homeScore" type="number" min="0" defaultValue={match.homeScore ?? ""} className="w-12 text-center h-9 font-bold" required />
              <Minus className="h-3 w-3 text-muted-foreground" />
              <Input name="awayScore" type="number" min="0" defaultValue={match.awayScore ?? ""} className="w-12 text-center h-9 font-bold" required />
              <Button type="submit" size="icon-sm" disabled={pending} className="ml-1">
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Editar resultado"
            >
              {isPlayed ? (
                <span className="font-bold text-2xl">{match.homeScore} - {match.awayScore}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-medium px-4 py-1 border border-dashed rounded-lg">
                  Anotar resultado
                </span>
              )}
            </button>
          )}

          <div className="text-left flex-1">
            <p className="font-bold text-sm">{match.awayTeam.name}</p>
          </div>
        </div>

        {/* Clear result */}
        {isPlayed && !editing && (
          <div className="flex justify-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-red-600"
              disabled={pending}
              onClick={() => startTransition(() => clearResult(match.id))}
            >
              Borrar resultado
            </Button>
          </div>
        )}

        {/* Events */}
        {isPlayed && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Eventos</p>

            {match.events.length > 0 && (
              <div className="space-y-1">
                {match.events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#fafafa]">
                    <span>
                      {eventIcons[e.type]} {e.player.name}
                      {e.minute ? ` (${e.minute}')` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-5 w-5 text-muted-foreground hover:text-red-600"
                      disabled={pending}
                      onClick={() => startTransition(() => removeMatchEvent(e.id))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add event */}
            {allPlayers.length > 0 ? (
              <form
                className="flex flex-wrap items-center gap-2"
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
                <select name="playerId" required className="text-xs border rounded px-2 py-1.5 bg-background flex-1 min-w-[120px]">
                  <option value="">Jugador...</option>
                  <optgroup label={match.homeTeam.name}>
                    {match.homeTeam.players.map((p) => (
                      <option key={p.id} value={p.id}>{p.number ? `#${p.number} ` : ""}{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label={match.awayTeam.name}>
                    {match.awayTeam.players.map((p) => (
                      <option key={p.id} value={p.id}>{p.number ? `#${p.number} ` : ""}{p.name}</option>
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
                <Input name="minute" type="number" min="0" max="120" placeholder="Min" className="w-14 h-7 text-xs" />
                <Button type="submit" size="sm" disabled={pending} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500">
                  {pending ? "..." : "+ Agregar"}
                </Button>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground">Registra jugadores para agregar eventos.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
