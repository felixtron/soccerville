import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, Trophy, Zap, CheckCircle, Clock } from "lucide-react";
import {
  GenerateFixturesButton,
  EnrollTeamButton,
  UnenrollTeamButton,
  MatchResultRow,
  StandingsTable,
} from "@/components/admin/tournament-detail";
import { MatchMap } from "@/components/admin/match-map";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Abierto", class: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Lleno", class: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "En curso", class: "bg-blue-100 text-blue-700" },
  FINISHED: { label: "Finalizado", class: "bg-gray-100 text-gray-600" },
};

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      venue: true,
      teams: {
        include: {
          team: { include: { captain: { select: { name: true } } } },
        },
        orderBy: { enrolledAt: "asc" },
      },
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true, players: { select: { id: true, name: true, number: true } } } },
          awayTeam: { select: { id: true, name: true, players: { select: { id: true, name: true, number: true } } } },
          events: {
            include: { player: { select: { name: true } } },
            orderBy: { minute: "asc" },
          },
        },
        orderBy: [{ matchDay: "asc" }, { createdAt: "asc" }],
      },
      standings: {
        include: { team: { select: { name: true } } },
        orderBy: [{ points: "desc" }, { goalDifference: "desc" }, { goalsFor: "desc" }],
      },
    },
  });

  if (!tournament) notFound();

  const enrolledTeamIds = tournament.teams.map((t) => t.teamId);
  const availableTeams = await prisma.team.findMany({
    where: enrolledTeamIds.length > 0 ? { id: { notIn: enrolledTeamIds } } : {},
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const status = statusMap[tournament.status] ?? statusMap.OPEN;
  const hasMatches = tournament.matches.length > 0;
  const matchDays = [...new Set(tournament.matches.map((m) => m.matchDay))].sort((a, b) => a - b);
  const playedCount = tournament.matches.filter((m) => m.status === "PLAYED" || m.status === "DEFAULTED").length;
  const totalMatches = tournament.matches.length;

  // Workflow steps
  const steps = [
    {
      label: "Inscribir equipos",
      done: tournament.teams.length >= 2,
      active: tournament.status === "OPEN" || tournament.status === "FULL",
      detail: `${tournament.teams.length}/${tournament.maxTeams} equipos`,
    },
    {
      label: "Generar fixtures",
      done: hasMatches,
      active: !hasMatches && tournament.teams.length >= 2,
      detail: hasMatches ? `${totalMatches} partidos` : "Pendiente",
    },
    {
      label: "Registrar resultados",
      done: tournament.status === "FINISHED",
      active: tournament.status === "IN_PROGRESS",
      detail: hasMatches ? `${playedCount}/${totalMatches} jugados` : "—",
    },
    {
      label: "Torneo finalizado",
      done: tournament.status === "FINISHED",
      active: false,
      detail: tournament.status === "FINISHED" ? "Completado" : "—",
    },
  ];

  // Match map data
  const matchMapData = tournament.matches.map((m) => ({
    id: m.id,
    matchDay: m.matchDay,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
  }));

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/torneos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Torneos
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
                {tournament.name}
              </h1>
              <Badge className={status.class}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {tournament.venue.name.replace("Soccerville ", "")}
              </span>
              <Badge variant="outline">{tournament.category}</Badge>
              <Badge variant="outline">{tournament.schedule}</Badge>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tournament.teams.length}/{tournament.maxTeams}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EnrollTeamButton tournamentId={tournament.id} availableTeams={availableTeams} />
            {!hasMatches && (
              <GenerateFixturesButton tournamentId={tournament.id} teamCount={tournament.teams.length} />
            )}
          </div>
        </div>
      </div>

      {/* Workflow progress */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    step.done ? "bg-emerald-500 text-white" :
                    step.active ? "bg-blue-500 text-white animate-pulse" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {step.done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <p className={`text-xs font-medium truncate ${step.done ? "text-emerald-700" : step.active ? "text-blue-700" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{step.detail}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-4 mx-1 shrink-0 ${step.done ? "bg-emerald-300" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match map (visual bracket) */}
      {hasMatches && (
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg uppercase tracking-tight flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Mapa de Partidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MatchMap matches={matchMapData} totalDays={matchDays.length} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Teams + Standings */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg uppercase tracking-tight">
                Equipos ({tournament.teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournament.teams.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay equipos inscritos aun
                </p>
              ) : (
                <div className="space-y-2">
                  {tournament.teams.map((tt, i) => (
                    <div key={tt.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#fafafa]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{tt.team.name}</p>
                          <p className="text-xs text-muted-foreground">Cap: {tt.team.captain.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {tt.inscriptionPaid && <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">Pagado</Badge>}
                        {!hasMatches && <UnenrollTeamButton tournamentId={tournament.id} teamId={tt.teamId} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {tournament.standings.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg uppercase tracking-tight flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Posiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <StandingsTable standings={tournament.standings} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Matches by day */}
        <div className="lg:col-span-2">
          {hasMatches ? (
            <div className="space-y-4">
              {matchDays.map((day) => {
                const dayMatches = tournament.matches.filter((m) => m.matchDay === day);
                const played = dayMatches.filter((m) => m.status === "PLAYED" || m.status === "DEFAULTED").length;
                return (
                  <Card key={day} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-base uppercase tracking-tight flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-bold">
                            {day}
                          </span>
                          Jornada {day}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {played === dayMatches.length ? (
                            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Completa</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{played}/{dayMatches.length}</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <tbody>
                          {dayMatches.map((match) => (
                            <MatchResultRow key={match.id} match={match} />
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No hay partidos generados</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {tournament.teams.length < 2
                    ? "Inscribe al menos 2 equipos para generar fixtures"
                    : "Click en 'Generar Fixtures' para crear el calendario automaticamente"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
