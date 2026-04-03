import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  Users,
  Trophy,
  Calendar,
  LogOut,
  ChevronRight,
  Target,
} from "lucide-react";
import { LogoUpload } from "@/components/captain/logo-upload";
import { RosterEditor } from "@/components/captain/roster-editor";
import { TeamLogo } from "@/components/shared/team-logo";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: "Programado", class: "bg-blue-500/10 text-blue-600" },
  PLAYED: { label: "Jugado", class: "bg-emerald-500/10 text-emerald-700" },
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

export default async function MiEquipoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  // If admin/operator, redirect to admin
  if (role === "ADMIN" || role === "OPERATOR") {
    redirect("/admin/dashboard");
  }

  // Find this captain's team
  const team = await prisma.team.findUnique({
    where: { captainId: userId },
    include: {
      players: { orderBy: { number: "asc" } },
      tournaments: {
        include: {
          tournament: {
            include: { venue: { select: { slug: true } } },
          },
        },
      },
    },
  });

  if (!team) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-xl uppercase tracking-tight mb-2">
              Sin equipo asignado
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu cuenta no tiene un equipo asociado. Contacta al administrador.
            </p>
            <form action="/api/auth/signout" method="POST" className="mt-6">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cerrar sesion
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get matches for active tournaments
  const activeTournamentIds = team.tournaments
    .filter((tt) => tt.tournament.status === "IN_PROGRESS")
    .map((tt) => tt.tournamentId);

  const matches = await prisma.match.findMany({
    where: {
      tournamentId: { in: activeTournamentIds },
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
    },
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      tournament: {
        select: { name: true, slug: true, venue: { select: { slug: true } } },
      },
    },
    orderBy: [{ matchDay: "asc" }],
  });

  // Get standings for active tournaments
  const standings = await prisma.standing.findMany({
    where: {
      tournamentId: { in: activeTournamentIds },
      teamId: team.id,
    },
    include: {
      tournament: { select: { name: true } },
    },
  });

  // Get player stats
  const playerEvents = await prisma.matchEvent.findMany({
    where: {
      match: { tournamentId: { in: activeTournamentIds } },
      teamId: team.id,
    },
  });

  const playerStatsMap = new Map<
    string,
    { goals: number; yellowCards: number; redCards: number }
  >();
  for (const e of playerEvents) {
    let s = playerStatsMap.get(e.playerId);
    if (!s) {
      s = { goals: 0, yellowCards: 0, redCards: 0 };
      playerStatsMap.set(e.playerId, s);
    }
    if (e.type === "GOAL") s.goals++;
    else if (e.type === "YELLOW_CARD") s.yellowCards++;
    else if (e.type === "RED_CARD") s.redCards++;
  }

  const played = matches.filter(
    (m) =>
      m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED"
  );
  const upcoming = matches.filter((m) => m.status === "SCHEDULED");

  function getResult(m: (typeof played)[0]) {
    if (m.homeScore === null || m.awayScore === null) return "—";
    const isHome = m.homeTeamId === team!.id;
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <LogoUpload currentUrl={team.logoUrl} teamName={team.name} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">
                  Portal Capitan
                </p>
                <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
                  {team.name}
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  Capitan: {session.user.name}
                </p>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Standings summary */}
        {standings.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {standings.map((s) => (
              <Card key={s.id} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    {s.tournament.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold">{s.points}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pts</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-600">{s.wins}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">G</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-amber-600">{s.draws}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">E</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-red-600">{s.losses}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">P</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">DG</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Roster (editable) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Plantilla ({team.players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RosterEditor
                players={team.players.map((p) => ({
                  id: p.id,
                  name: p.name,
                  number: p.number,
                  position: p.position,
                }))}
                playerStats={Object.fromEntries(playerStatsMap)}
              />
            </CardContent>
          </Card>

          {/* Matches */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Proximos Partidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcoming.slice(0, 5).map((m) => {
                      const isHome = m.homeTeamId === team!.id;
                      const opponent = isHome ? m.awayTeam : m.homeTeam;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#f5f5f5]"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">
                                J{m.matchDay}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {isHome ? "vs" : "@"}
                              </span>
                              <span className="text-sm font-medium">{opponent.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDate(m.date)}
                              {m.time && ` · ${m.time}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent results */}
            {played.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Resultados Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {played
                      .slice()
                      .reverse()
                      .slice(0, 8)
                      .map((m) => {
                        const isHome = m.homeTeamId === team!.id;
                        const opponent = isHome ? m.awayTeam : m.homeTeam;
                        const r = getResult(m);
                        return (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
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
                                <span className="text-xs text-muted-foreground">J{m.matchDay}</span>
                                <span className="text-xs text-muted-foreground">
                                  {isHome ? "vs" : "@"}
                                </span>
                                <span className="text-sm font-medium truncate">
                                  {opponent.name}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(m.date)}
                              </div>
                            </div>
                            <span className="font-bold text-sm shrink-0">
                              {m.homeScore} - {m.awayScore}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links to public tournament pages */}
            {team.tournaments
              .filter((tt) => tt.tournament.status === "IN_PROGRESS")
              .map((tt) => (
                <Link
                  key={tt.id}
                  href={`/torneos/${tt.tournament.venue.slug}/${tt.tournament.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium">{tt.tournament.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ver calendario, posiciones y estadisticas
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
