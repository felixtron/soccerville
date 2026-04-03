import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, Trophy } from "lucide-react";
import {
  GenerateFixturesButton,
  EnrollTeamButton,
  UnenrollTeamButton,
  MatchResultRow,
  StandingsTable,
} from "@/components/admin/tournament-detail";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Abierto", class: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Lleno", class: "bg-red-100 text-red-700" },
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
        include: { team: { include: { captain: { select: { name: true } } } } },
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

  // Get teams NOT enrolled in this tournament for the enroll dialog
  const enrolledTeamIds = tournament.teams.map((t) => t.teamId);
  const availableTeams = await prisma.team.findMany({
    where: enrolledTeamIds.length > 0 ? { id: { notIn: enrolledTeamIds } } : {},
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const status = statusMap[tournament.status] ?? statusMap.OPEN;
  const hasMatches = tournament.matches.length > 0;
  const matchDays = [...new Set(tournament.matches.map((m) => m.matchDay))].sort(
    (a, b) => a - b
  );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/torneos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torneos
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
            <EnrollTeamButton
              tournamentId={tournament.id}
              availableTeams={availableTeams}
            />
            {!hasMatches && (
              <GenerateFixturesButton
                tournamentId={tournament.id}
                teamCount={tournament.teams.length}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Teams + Standings */}
        <div className="space-y-6">
          {/* Enrolled Teams */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg uppercase tracking-tight">
                Equipos Inscritos ({tournament.teams.length})
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
                    <div
                      key={tt.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#fafafa]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{tt.team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Cap: {tt.team.captain.name}
                          </p>
                        </div>
                      </div>
                      {!hasMatches && (
                        <UnenrollTeamButton
                          tournamentId={tournament.id}
                          teamId={tt.teamId}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Standings */}
          {tournament.standings.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg uppercase tracking-tight flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Tabla de Posiciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <StandingsTable standings={tournament.standings} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Matches */}
        <div className="lg:col-span-2">
          {hasMatches ? (
            <div className="space-y-4">
              {matchDays.map((day) => {
                const dayMatches = tournament.matches.filter(
                  (m) => m.matchDay === day
                );
                const played = dayMatches.filter((m) => m.status === "PLAYED").length;
                return (
                  <Card key={day} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-base uppercase tracking-tight">
                          Jornada {day}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {played}/{dayMatches.length} jugados
                        </span>
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
                  Inscribe equipos y luego genera los fixtures automaticamente
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
