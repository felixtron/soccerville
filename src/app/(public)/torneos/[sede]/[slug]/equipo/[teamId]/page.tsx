import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ArrowLeft, Users, Trophy, Target, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { TeamLogo } from "@/components/shared/team-logo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sede: string; slug: string; teamId: string }>;
}): Promise<Metadata> {
  const { teamId, slug } = await params;
  const [team, tournament] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId }, select: { name: true } }),
    prisma.tournament.findUnique({ where: { slug }, select: { name: true } }),
  ]);
  if (!team || !tournament) return {};
  return {
    title: `${team.name} — ${tournament.name}`,
    description: `Perfil del equipo ${team.name} en ${tournament.name}`,
  };
}

const matchStatusLabel: Record<string, { label: string; class: string }> = {
  PLAYED: { label: "Jugado", class: "bg-emerald-500/10 text-emerald-700" },
  SCHEDULED: { label: "Programado", class: "bg-blue-500/10 text-blue-600" },
  CANCELLED: { label: "Cancelado", class: "bg-red-500/10 text-red-600" },
  DEFAULTED: { label: "Default", class: "bg-orange-500/10 text-orange-600" },
  ABANDONED: { label: "Abandono", class: "bg-purple-500/10 text-purple-600" },
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ sede: string; slug: string; teamId: string }>;
}) {
  const { sede, slug, teamId } = await params;

  const [tournament, team] = await Promise.all([
    prisma.tournament.findUnique({
      where: { slug },
      include: { venue: { select: { slug: true } } },
    }),
    prisma.team.findUnique({
      where: { id: teamId },
      include: {
        captain: { select: { name: true } },
        players: {
          orderBy: { number: "asc" },
        },
      },
    }),
  ]);

  if (!tournament || !team || tournament.venue.slug !== sede) notFound();

  // Get this team's matches in this tournament
  const matches = await prisma.match.findMany({
    where: {
      tournamentId: tournament.id,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      events: {
        include: { player: { select: { name: true } } },
      },
    },
    orderBy: [{ matchDay: "asc" }],
  });

  // Get standing for this team
  const standing = await prisma.standing.findUnique({
    where: { tournamentId_teamId: { tournamentId: tournament.id, teamId } },
  });

  // Get player stats from events
  const playerEvents = await prisma.matchEvent.findMany({
    where: {
      match: { tournamentId: tournament.id },
      teamId,
    },
    include: { player: { select: { id: true, name: true } } },
  });

  // Aggregate player stats
  const playerStatsMap = new Map<
    string,
    { goals: number; ownGoals: number; yellowCards: number; redCards: number; sanctions: number }
  >();
  for (const e of playerEvents) {
    let stats = playerStatsMap.get(e.playerId);
    if (!stats) {
      stats = { goals: 0, ownGoals: 0, yellowCards: 0, redCards: 0, sanctions: 0 };
      playerStatsMap.set(e.playerId, stats);
    }
    if (e.type === "GOAL") stats.goals++;
    else if (e.type === "OWN_GOAL") stats.ownGoals++;
    else if (e.type === "YELLOW_CARD") stats.yellowCards++;
    else if (e.type === "RED_CARD") stats.redCards++;
    else if (e.type === "SANCTION") stats.sanctions++;
  }

  // Split matches
  const played = matches.filter(
    (m) => m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED"
  );
  const upcoming = matches.filter((m) => m.status === "SCHEDULED");

  // Determine result for each played match
  function getResult(m: (typeof played)[0]) {
    if (m.homeScore === null || m.awayScore === null) return "—";
    const isHome = m.homeTeamId === teamId;
    const teamScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (teamScore > oppScore) return "G";
    if (teamScore < oppScore) return "P";
    return "E";
  }

  const resultColors: Record<string, string> = {
    G: "bg-emerald-500 text-white",
    P: "bg-red-500 text-white",
    E: "bg-amber-500 text-white",
  };

  return (
    <>
      {/* Header */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-16 md:pt-24 md:pb-20">
          <LinkButton
            href={`/torneos/${sede}/${slug}`}
            size="sm"
            className="mb-6 rounded-full !bg-transparent !text-white/60 !border !border-white/20 hover:!border-white hover:!text-white hover:!bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {tournament.name}
          </LinkButton>
          <div className="flex items-center gap-5">
            <TeamLogo logoUrl={team.logoUrl} teamName={team.name} size="xl" className="ring-white/20" />
            <div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.85]">
                {team.name}
              </h1>
              <p className="mt-3 text-white/40 text-sm">
                Capitan: {team.captain.name} &middot; {tournament.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Stats + Roster */}
          <div className="space-y-6">
            {/* Standing summary */}
            {standing && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Posicion en el Torneo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold">{standing.points}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Pts
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{standing.wins}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        G
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">{standing.draws}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        E
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{standing.losses}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        P
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between text-sm text-muted-foreground">
                    <span>
                      GF: <span className="font-medium text-foreground">{standing.goalsFor}</span>
                    </span>
                    <span>
                      GC:{" "}
                      <span className="font-medium text-foreground">{standing.goalsAgainst}</span>
                    </span>
                    <span>
                      DG:{" "}
                      <span className="font-medium text-foreground">
                        {standing.goalDifference > 0
                          ? `+${standing.goalDifference}`
                          : standing.goalDifference}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form - last 5 results */}
            {played.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Forma</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1.5">
                    {played.slice(-5).map((m) => {
                      const r = getResult(m);
                      return (
                        <span
                          key={m.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            resultColors[r] ?? "bg-gray-200"
                          }`}
                        >
                          {r}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Roster */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Plantilla
                </CardTitle>
              </CardHeader>
              <CardContent>
                {team.players.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay jugadores registrados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Jugador</th>
                          <th className="p-2 text-center">
                            <Target className="h-3 w-3 inline" />
                          </th>
                          <th className="p-2 text-center">
                            <span className="inline-block w-2.5 h-3.5 bg-amber-400 rounded-[1px]" />
                          </th>
                          <th className="p-2 text-center">
                            <span className="inline-block w-2.5 h-3.5 bg-red-500 rounded-[1px]" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.players.map((p) => {
                          const stats = playerStatsMap.get(p.id);
                          return (
                            <tr key={p.id} className="border-b">
                              <td className="p-2 text-muted-foreground font-mono text-xs">
                                {p.number ?? "—"}
                              </td>
                              <td className="p-2 font-medium">
                                {p.name}
                                {p.position && (
                                  <span className="ml-1.5 text-[10px] text-muted-foreground uppercase">
                                    {p.position}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-center font-bold">
                                {stats?.goals || ""}
                              </td>
                              <td className="p-2 text-center text-amber-600">
                                {stats?.yellowCards || ""}
                              </td>
                              <td className="p-2 text-center text-red-600">
                                {stats?.redCards || ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Matches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Played matches */}
            {played.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ultimos Partidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {played
                      .slice()
                      .reverse()
                      .map((m) => {
                        const isHome = m.homeTeamId === teamId;
                        const opponent = isHome ? m.awayTeam : m.homeTeam;
                        const r = getResult(m);
                        const st = matchStatusLabel[m.status];
                        return (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] transition-colors"
                          >
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                resultColors[r] ?? "bg-gray-200"
                              }`}
                            >
                              {r}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  J{m.matchDay}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {isHome ? "vs" : "@"}
                                </span>
                                <Link
                                  href={`/torneos/${sede}/${slug}/equipo/${opponent.id}`}
                                  className="font-medium text-sm hover:underline truncate"
                                >
                                  {opponent.name}
                                </Link>
                              </div>
                              {formatDate(m.date) && (
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(m.date)}
                                  {m.time && ` · ${m.time}`}
                                </div>
                              )}
                              {/* Match events */}
                              {m.events.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.events.map((e) => (
                                    <span
                                      key={e.id}
                                      className="text-[10px] text-muted-foreground"
                                    >
                                      {e.type === "GOAL"
                                        ? "⚽"
                                        : e.type === "OWN_GOAL"
                                        ? "⚽🔴"
                                        : e.type === "YELLOW_CARD"
                                        ? "🟨"
                                        : e.type === "RED_CARD"
                                        ? "🟥"
                                        : "⛔"}{" "}
                                      {e.player.name}
                                      {e.minute ? ` ${e.minute}'` : ""}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold">
                                {m.homeScore} - {m.awayScore}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming matches */}
            {upcoming.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Proximos Partidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcoming.map((m) => {
                      const isHome = m.homeTeamId === teamId;
                      const opponent = isHome ? m.awayTeam : m.homeTeam;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] transition-colors"
                        >
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            J{m.matchDay}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {isHome ? "vs" : "@"}
                              </span>
                              <Link
                                href={`/torneos/${sede}/${slug}/equipo/${opponent.id}`}
                                className="font-medium text-sm hover:underline truncate"
                              >
                                {opponent.name}
                              </Link>
                            </div>
                            {formatDate(m.date) && (
                              <div className="text-xs text-muted-foreground">
                                {formatDate(m.date)}
                                {m.time && ` · ${m.time}`}
                                {m.fieldNumber && ` · Cancha ${m.fieldNumber}`}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
