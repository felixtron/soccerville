"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Target, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { TeamLogo } from "@/components/shared/team-logo";
import type { TopScorer, CardSummary } from "@/lib/fixtures";

// ─── Types ─────────────────────────────────────────────────

type MatchEvent = {
  id: string;
  type: string;
  minute: number | null;
  playerName: string;
  teamId: string;
};

type MatchData = {
  id: string;
  matchDay: number;
  homeTeam: { id: string; name: string; logoUrl: string | null };
  awayTeam: { id: string; name: string; logoUrl: string | null };
  homeScore: number | null;
  awayScore: number | null;
  date: string | null;
  time: string | null;
  fieldNumber: number | null;
  groupName: string | null;
  status: string;
  events: MatchEvent[];
};

type StandingData = {
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
  groupName: string | null;
  points: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

type Props = {
  sede: string;
  slug: string;
  matches: MatchData[];
  standings: StandingData[];
  teams: { id: string; name: string }[];
  groups: string[];
  topScorers: TopScorer[];
  cardSummary: CardSummary[];
};

// ─── Status helpers ────────────────────────────────────────

const matchStatusLabel: Record<string, { label: string; class: string }> = {
  PLAYED: { label: "Jugado", class: "bg-emerald-500/10 text-emerald-700" },
  SCHEDULED: { label: "Programado", class: "bg-blue-500/10 text-blue-600" },
  CANCELLED: { label: "Cancelado", class: "bg-red-500/10 text-red-600" },
  DEFAULTED: { label: "Default", class: "bg-orange-500/10 text-orange-600" },
  ABANDONED: { label: "Abandono", class: "bg-purple-500/10 text-purple-600" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ─── Main Component ────────────────────────────────────────

export function TournamentTabs({
  sede,
  slug,
  matches,
  standings,
  teams,
  groups,
  topScorers,
  cardSummary,
}: Props) {
  return (
    <Tabs defaultValue="calendario">
      <TabsList variant="line" className="mb-6 flex-wrap">
        <TabsTrigger value="calendario" className="gap-1.5">
          <Calendar className="h-4 w-4" /> Calendario
        </TabsTrigger>
        <TabsTrigger value="posiciones" className="gap-1.5">
          <Trophy className="h-4 w-4" /> Posiciones
        </TabsTrigger>
        <TabsTrigger value="goleadores" className="gap-1.5">
          <Target className="h-4 w-4" /> Bota de Oro
        </TabsTrigger>
        <TabsTrigger value="amonestaciones" className="gap-1.5">
          <AlertTriangle className="h-4 w-4" /> Amonestaciones
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calendario">
        <ScheduleView
          matches={matches}
          teams={teams}
          groups={groups}
          sede={sede}
          slug={slug}
        />
      </TabsContent>

      <TabsContent value="posiciones">
        <StandingsView standings={standings} groups={groups} sede={sede} slug={slug} />
      </TabsContent>

      <TabsContent value="goleadores">
        <TopScorersView scorers={topScorers} />
      </TabsContent>

      <TabsContent value="amonestaciones">
        <CardsView cards={cardSummary} />
      </TabsContent>
    </Tabs>
  );
}

// ─── Schedule View ─────────────────────────────────────────

function ScheduleView({
  matches,
  teams,
  groups,
  sede,
  slug,
}: {
  matches: MatchData[];
  teams: { id: string; name: string }[];
  groups: string[];
  sede: string;
  slug: string;
}) {
  const [view, setView] = useState<"completo" | "equipo">("completo");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const filtered = useMemo(() => {
    let result = matches;
    if (view === "equipo" && selectedTeam) {
      result = result.filter(
        (m) => m.homeTeam.id === selectedTeam || m.awayTeam.id === selectedTeam
      );
    }
    if (selectedGroup) {
      result = result.filter((m) => m.groupName === selectedGroup);
    }
    return result;
  }, [matches, view, selectedTeam, selectedGroup]);

  // Group by matchDay
  const byMatchDay = useMemo(() => {
    const map = new Map<number, MatchData[]>();
    for (const m of filtered) {
      if (!map.has(m.matchDay)) map.set(m.matchDay, []);
      map.get(m.matchDay)!.push(m);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("completo")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              view === "completo"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rol Completo
          </button>
          <button
            onClick={() => setView("equipo")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              view === "equipo"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Equipo
          </button>
        </div>

        {view === "equipo" && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {groups.length > 0 && (
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            <option value="">Todos los grupos</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Match days */}
      {byMatchDay.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No hay partidos para mostrar.
        </p>
      ) : (
        <div className="space-y-6">
          {byMatchDay.map(([day, dayMatches]) => (
            <div key={day}>
              <h3 className="font-display text-lg uppercase tracking-tight mb-3 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-bold">
                  {day}
                </span>
                Jornada {day}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Hora</th>
                      <th className="p-2 text-right">Local</th>
                      <th className="p-2 text-center w-20">Score</th>
                      <th className="p-2 text-left">Visitante</th>
                      <th className="p-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayMatches.map((m) => {
                      const st = matchStatusLabel[m.status] ?? matchStatusLabel.SCHEDULED;
                      return (
                        <tr
                          key={m.id}
                          className="border-b hover:bg-[#fafafa] transition-colors"
                        >
                          <td className="p-2 text-muted-foreground text-xs">
                            {formatDate(m.date)}
                          </td>
                          <td className="p-2 text-muted-foreground text-xs">
                            {m.time ?? "—"}
                            {m.fieldNumber ? ` · C${m.fieldNumber}` : ""}
                          </td>
                          <td className="p-2 text-right font-medium">
                            <Link
                              href={`/torneos/${sede}/${slug}/equipo/${m.homeTeam.id}`}
                              className="hover:underline inline-flex items-center gap-1.5 justify-end"
                            >
                              {m.homeTeam.name}
                              <TeamLogo logoUrl={m.homeTeam.logoUrl} teamName={m.homeTeam.name} size="xs" />
                            </Link>
                          </td>
                          <td className="p-2 text-center">
                            {m.status === "PLAYED" ||
                            m.status === "DEFAULTED" ||
                            m.status === "ABANDONED" ? (
                              <span className="font-bold">
                                {m.homeScore} - {m.awayScore}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">vs</span>
                            )}
                          </td>
                          <td className="p-2 font-medium">
                            <Link
                              href={`/torneos/${sede}/${slug}/equipo/${m.awayTeam.id}`}
                              className="hover:underline inline-flex items-center gap-1.5"
                            >
                              <TeamLogo logoUrl={m.awayTeam.logoUrl} teamName={m.awayTeam.name} size="xs" />
                              {m.awayTeam.name}
                            </Link>
                          </td>
                          <td className="p-2 text-center">
                            <Badge className={`text-[10px] ${st.class}`}>
                              {st.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Standings View ────────────────────────────────────────

function StandingsView({
  standings,
  groups,
  sede,
  slug,
}: {
  standings: StandingData[];
  groups: string[];
  sede: string;
  slug: string;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const filtered = useMemo(() => {
    if (!selectedGroup) return standings;
    return standings.filter((s) => s.groupName === selectedGroup);
  }, [standings, selectedGroup]);

  return (
    <div>
      {groups.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            <option value="">Todos los grupos</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

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
            {filtered.map((s, i) => (
              <tr
                key={s.teamId}
                className={`border-b hover:bg-[#fafafa] transition-colors ${
                  i < 4
                    ? "border-l-2 border-l-emerald-500"
                    : i >= filtered.length - 2
                    ? "border-l-2 border-l-red-400"
                    : ""
                }`}
              >
                <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
                <td className="p-3 font-medium">
                  <Link
                    href={`/torneos/${sede}/${slug}/equipo/${s.teamId}`}
                    className="hover:underline flex items-center gap-2"
                  >
                    <TeamLogo logoUrl={s.teamLogoUrl} teamName={s.teamName} size="xs" />
                    {s.teamName}
                  </Link>
                </td>
                <td className="p-3 text-center">{s.gamesPlayed}</td>
                <td className="p-3 text-center text-emerald-600">{s.wins}</td>
                <td className="p-3 text-center text-amber-600">{s.draws}</td>
                <td className="p-3 text-center text-red-600">{s.losses}</td>
                <td className="p-3 text-center">{s.goalsFor}</td>
                <td className="p-3 text-center">{s.goalsAgainst}</td>
                <td className="p-3 text-center">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="p-3 text-center font-bold text-lg">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Top Scorers View ──────────────────────────────────────

function TopScorersView({ scorers }: { scorers: TopScorer[] }) {
  if (scorers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        Aun no hay goles registrados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Jugador</th>
            <th className="p-3 text-left">Equipo</th>
            <th className="p-3 text-center font-bold">Goles</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={s.playerId} className="border-b hover:bg-[#fafafa] transition-colors">
              <td className="p-3 font-bold text-muted-foreground">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </td>
              <td className="p-3 font-medium">{s.playerName}</td>
              <td className="p-3 text-muted-foreground">{s.teamName}</td>
              <td className="p-3 text-center font-bold text-lg">{s.goals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Cards View ────────────────────────────────────────────

function CardsView({ cards }: { cards: CardSummary[] }) {
  if (cards.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">
        No hay amonestaciones registradas.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Jugador</th>
            <th className="p-3 text-left">Equipo</th>
            <th className="p-3 text-center">
              <span className="inline-block w-3 h-4 bg-amber-400 rounded-[1px]" title="Amarillas" />
            </th>
            <th className="p-3 text-center">
              <span className="inline-block w-3 h-4 bg-red-500 rounded-[1px]" title="Rojas" />
            </th>
            <th className="p-3 text-center">Sanc.</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c, i) => (
            <tr key={c.playerId} className="border-b hover:bg-[#fafafa] transition-colors">
              <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
              <td className="p-3 font-medium">{c.playerName}</td>
              <td className="p-3 text-muted-foreground">{c.teamName}</td>
              <td className="p-3 text-center text-amber-600 font-bold">{c.yellowCards}</td>
              <td className="p-3 text-center text-red-600 font-bold">{c.redCards}</td>
              <td className="p-3 text-center">{c.sanctions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
