"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
  Star,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  recordResult,
  clearResult,
  addMatchEvent,
  removeMatchEvent,
  registerMatchParticipants,
  setMatchAsFinal,
  checkFinalsEligibility,
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
type MatchParticipant = { playerId: string; teamId: string };
type Match = {
  id: string;
  matchDay: number;
  homeTeam: { id: string; name: string; players: Player[] };
  awayTeam: { id: string; name: string; players: Player[] };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  isFinal: boolean;
  events: MatchEvent[];
  participants: MatchParticipant[];
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
  // tournamentId is used in MatchDetailPanel via closure
  const tid = tournamentId;
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
          {hasMatches && <span className="text-[10px] text-muted-foreground ml-1">{played}/{matches.length}</span>}
        </TabsTrigger>
        <TabsTrigger value="posiciones" className="gap-1.5 text-xs">
          <Trophy className="h-3.5 w-3.5" /> Posiciones
        </TabsTrigger>
        <TabsTrigger value="equipos" className="gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5" /> Equipos <span className="text-[10px] text-muted-foreground ml-1">{teamCount}</span>
        </TabsTrigger>
      </TabsList>

      {/* ─── Partidos Tab ─── */}
      <TabsContent value="partidos">
        {!hasMatches ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No hay partidos generados</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {teamCount < 2 ? "Inscribe al menos 2 equipos" : "Click en 'Generar Fixtures'"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
            </div>

            {/* 2-column layout: grid left, detail right (sticky) */}
            <div className="flex gap-4">
              {/* Match grid */}
              <div className={`space-y-4 ${selectedMatch ? "flex-1 min-w-0" : "w-full"}`}>
                {byDay.map(([day, dayMatches]) => {
                  const dayPlayed = dayMatches.filter((m) => m.status === "PLAYED" || m.status === "DEFAULTED").length;
                  const isComplete = dayPlayed === dayMatches.length;
                  return (
                    <div key={day}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-5 w-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-bold">{day}</span>
                        <span className="text-xs font-medium text-muted-foreground">Jornada {day}</span>
                        {isComplete && <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Completa</Badge>}
                      </div>
                      <div className={`grid gap-1.5 ${selectedMatch ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
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
                                  : m.isFinal
                                  ? "bg-amber-50 shadow-sm hover:shadow-md ring-1 ring-amber-200"
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
                              <div className="flex items-center gap-1 ml-1 shrink-0">
                                {m.isFinal && <Star className="h-3 w-3 text-amber-500 fill-amber-400" />}
                                {isPlayed && m.events.length > 0 && (
                                  <span className="text-[9px] text-muted-foreground">{m.events.length}ev</span>
                                )}
                              </div>
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
                </div>
              </div>

              {/* Sticky detail panel */}
              {selectedMatch && (
                <div className="w-80 shrink-0 hidden lg:block">
                  <div className="sticky top-20">
                    <MatchDetailPanel
                      match={selectedMatch}
                      tournamentId={tid}
                      onClose={() => setSelectedMatchId(null)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: detail panel below (shown as sheet-like card) */}
            {selectedMatch && (
              <div className="lg:hidden mt-4">
                <MatchDetailPanel
                  match={selectedMatch}
                  tournamentId={tid}
                  onClose={() => setSelectedMatchId(null)}
                />
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* ─── Posiciones Tab ─── */}
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

      {/* ─── Equipos Tab ─── */}
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
  tournamentId,
  onClose,
}: {
  match: Match;
  tournamentId: string;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [showLineup, setShowLineup] = useState(false);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const isPlayed = match.status === "PLAYED" || match.status === "DEFAULTED" || match.status === "ABANDONED";

  const allPlayers = [
    ...match.homeTeam.players.map((p) => ({ ...p, teamId: match.homeTeam.id })),
    ...match.awayTeam.players.map((p) => ({ ...p, teamId: match.awayTeam.id })),
  ];

  // Scroll into view on mobile when panel opens
  useEffect(() => {
    if (panelRef.current && window.innerWidth < 1024) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [match.id]);

  return (
    <Card ref={panelRef} className="border-0 shadow-lg ring-1 ring-blue-200">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">J{match.matchDay}</Badge>
            {match.isFinal && (
              <Badge className="bg-amber-100 text-amber-700 text-[9px] gap-1">
                <Star className="h-2.5 w-2.5 fill-amber-500" /> Final
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Mark as Final */}
            <Button
              variant="ghost"
              size="icon-sm"
              title={match.isFinal ? "Quitar Final" : "Marcar Final"}
              className={match.isFinal ? "text-amber-500" : "text-muted-foreground"}
              disabled={pending}
              onClick={() => startTransition(() => setMatchAsFinal(match.id, !match.isFinal))}
            >
              <Star className={`h-3.5 w-3.5 ${match.isFinal ? "fill-amber-400" : ""}`} />
            </Button>
            {/* Lineup */}
            <Button
              variant="ghost"
              size="icon-sm"
              title="Alineacion"
              className={showLineup ? "bg-muted text-blue-600" : "text-muted-foreground"}
              onClick={() => setShowLineup(!showLineup)}
            >
              <Users className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Teams + Score */}
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{match.homeTeam.name}</p>

          {editing ? (
            <form
              className="flex items-center justify-center gap-1"
              action={(formData) => {
                startTransition(async () => {
                  await recordResult(match.id, formData);
                  setEditing(false);
                });
              }}
            >
              <Input name="homeScore" type="number" min="0" defaultValue={match.homeScore ?? ""} className="w-14 text-center h-10 font-bold text-lg" required />
              <Minus className="h-3 w-3 text-muted-foreground mx-1" />
              <Input name="awayScore" type="number" min="0" defaultValue={match.awayScore ?? ""} className="w-14 text-center h-10 font-bold text-lg" required />
              <div className="flex gap-1 ml-2">
                <Button type="submit" size="icon-sm" disabled={pending}><Check className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            </form>
          ) : (
            <button onClick={() => setEditing(true)} className="block w-full py-2 rounded-lg hover:bg-gray-50 transition-colors">
              {isPlayed ? (
                <span className="font-bold text-3xl">{match.homeScore} - {match.awayScore}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-medium px-6 py-2 border border-dashed rounded-lg inline-block">
                  Anotar resultado
                </span>
              )}
            </button>
          )}

          <p className="text-xs font-medium text-muted-foreground">{match.awayTeam.name}</p>
        </div>

        {/* Clear result */}
        {isPlayed && !editing && (
          <button
            className="w-full text-center text-[10px] text-muted-foreground hover:text-red-600 transition-colors py-1"
            disabled={pending}
            onClick={() => startTransition(() => clearResult(match.id))}
          >
            Borrar resultado
          </button>
        )}

        {/* Lineup panel */}
        {showLineup && (
          <InlineLineupPanel
            match={match}
            tournamentId={tournamentId}
            onClose={() => setShowLineup(false)}
          />
        )}

        {/* Events */}
        {isPlayed && (
          <div className="border-t pt-3 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Eventos</p>

            {match.events.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {match.events.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#fafafa]">
                    <span className="truncate">
                      {eventIcons[e.type]} {e.player.name}
                      {e.minute ? ` (${e.minute}')` : ""}
                    </span>
                    <Button variant="ghost" size="icon-sm" className="h-5 w-5 shrink-0 text-muted-foreground hover:text-red-600" disabled={pending}
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
                className="space-y-2"
                action={(formData) => {
                  startTransition(async () => {
                    const playerId = formData.get("playerId") as string;
                    const player = allPlayers.find((p) => p.id === playerId);
                    if (!player) return;
                    await addMatchEvent(
                      match.id, playerId, player.teamId,
                      formData.get("type") as string,
                      formData.get("minute") ? parseInt(formData.get("minute") as string) : undefined,
                    );
                  });
                }}
              >
                <select name="playerId" required className="w-full text-xs border rounded px-2 py-1.5 bg-background">
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
                <div className="flex gap-2">
                  <select name="type" required className="flex-1 text-xs border rounded px-2 py-1.5 bg-background">
                    <option value="GOAL">⚽ Gol</option>
                    <option value="OWN_GOAL">⚽🔴 Autogol</option>
                    <option value="YELLOW_CARD">🟨 Amarilla</option>
                    <option value="RED_CARD">🟥 Roja</option>
                    <option value="SANCTION">⛔ Sancion</option>
                  </select>
                  <Input name="minute" type="number" min="0" max="120" placeholder="Min" className="w-14 h-7 text-xs" />
                </div>
                <Button type="submit" size="sm" disabled={pending} className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-500">
                  {pending ? "..." : "+ Agregar evento"}
                </Button>
              </form>
            ) : (
              <p className="text-[10px] text-muted-foreground">Registra jugadores para agregar eventos.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Inline Lineup Panel ────────────────────────────────────

function InlineLineupPanel({
  match,
  tournamentId,
  onClose,
}: {
  match: Match;
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
  const [checking, setChecking] = useState(false);

  function toggle(set: Set<string>, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  async function handleCheck() {
    setChecking(true);
    try {
      const result = await checkFinalsEligibility(tournamentId, match.id);
      setEligibility(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="border-t pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Alineacion
        </p>
        <div className="flex items-center gap-1">
          {match.isFinal && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
              disabled={checking}
              onClick={handleCheck}
            >
              <ShieldCheck className="h-3 w-3 mr-1" />
              {checking ? "..." : "Regla 80%"}
            </Button>
          )}
          <Button
            size="sm"
            className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-500"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await registerMatchParticipants(
                  match.id,
                  Array.from(homeSelected),
                  Array.from(awaySelected)
                );
                onClose();
              });
            }}
          >
            <Check className="h-3 w-3 mr-1" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Eligibility result */}
      {eligibility && (
        <div className="space-y-2">
          {[eligibility.homeTeam, eligibility.awayTeam].map((team) => (
            <div
              key={team.name}
              className={`rounded-lg p-2 text-[10px] ${
                team.eligible ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                {team.eligible ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <ShieldAlert className="h-3 w-3" />
                )}
                {team.name}: {team.percent === 0 ? "Sin alineacion" : `${team.percent}% elegibles`}
              </div>
              {!team.eligible && team.missing.length > 0 && (
                <p className="mt-0.5">No elegibles: {team.missing.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Player checkboxes */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { team: match.homeTeam, selected: homeSelected, setSelected: setHomeSelected },
          { team: match.awayTeam, selected: awaySelected, setSelected: setAwaySelected },
        ].map(({ team, selected, setSelected }) => (
          <div key={team.id}>
            <p className="text-[10px] font-medium mb-1.5 truncate">{team.name}</p>
            {team.players.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">Sin jugadores</p>
            ) : (
              <div className="space-y-0.5 max-h-36 overflow-y-auto">
                {team.players.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-1.5 text-[10px] cursor-pointer hover:bg-blue-50/50 px-1 py-0.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => setSelected(toggle(selected, p.id))}
                      className="w-3 h-3"
                    />
                    {p.number && <span className="text-muted-foreground">#{p.number}</span>}
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-[9px] text-muted-foreground mt-1">{selected.size} sel.</p>
          </div>
        ))}
      </div>

      {match.isFinal && (
        <p className="text-[9px] text-amber-700 bg-amber-50 rounded p-1.5">
          Partido de Final — guarda la alineacion y usa "Regla 80%" para verificar elegibilidad.
        </p>
      )}
    </div>
  );
}
