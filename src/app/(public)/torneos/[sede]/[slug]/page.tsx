import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateTopScorers, calculateCardSummary } from "@/lib/fixtures";
import { TournamentTabs } from "@/components/public/tournament-tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Inscripciones Abiertas", class: "bg-amber-500/10 text-amber-700 border-amber-200" },
  FULL: { label: "Lleno", class: "bg-red-500/10 text-red-600 border-red-200" },
  IN_PROGRESS: { label: "En Curso", class: "bg-blue-500/10 text-blue-600 border-blue-200" },
  FINISHED: { label: "Finalizado", class: "bg-gray-500/10 text-gray-600 border-gray-200" },
};

const categoryLabels: Record<string, string> = {
  VARONIL: "Varonil",
  FEMENIL: "Femenil",
  VETERANOS: "Veteranos",
  MIXTO: "Mixto",
};

const scheduleLabels: Record<string, string> = {
  NOCTURNO: "Nocturno",
  VESPERTINO: "Vespertino",
  MATUTINO: "Matutino",
  SABATINO: "Sabatino",
  DOMINICAL: "Dominical",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sede: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!tournament) return {};
  return {
    title: tournament.name,
    description: `Calendario, posiciones y estadísticas del torneo ${tournament.name}`,
  };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ sede: string; slug: string }>;
}) {
  const { sede, slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      venue: { select: { name: true, slug: true } },
      teams: {
        include: { team: { select: { id: true, name: true, logoUrl: true } } },
      },
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          events: {
            include: {
              player: { select: { name: true } },
            },
          },
        },
        orderBy: [{ matchDay: "asc" }, { date: "asc" }, { time: "asc" }],
      },
      standings: {
        include: { team: { select: { id: true, name: true, logoUrl: true } } },
        orderBy: [{ points: "desc" }, { goalDifference: "desc" }, { goalsFor: "desc" }],
      },
    },
  });

  if (!tournament || tournament.venue.slug !== sede) notFound();

  // Build event data for stats
  const allEvents = tournament.matches.flatMap((m) =>
    m.events.map((e) => ({
      playerId: e.playerId,
      playerName: e.player.name,
      teamName:
        e.teamId === m.homeTeam.id ? m.homeTeam.name : m.awayTeam.name,
      type: e.type,
    }))
  );

  const topScorers = calculateTopScorers(allEvents);
  const cardSummary = calculateCardSummary(allEvents);

  // Get unique groups
  const groups = [
    ...new Set(tournament.standings.map((s) => s.groupName).filter(Boolean)),
  ] as string[];

  // Build teams list for filter
  const teams = tournament.teams.map((t) => ({
    id: t.team.id,
    name: t.team.name,
  }));

  const status = statusLabels[tournament.status] ?? statusLabels.OPEN;

  return (
    <>
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-16 md:pt-24 md:pb-20">
          <LinkButton
            href={`/torneos/${sede}`}
            size="sm"
            className="mb-6 rounded-full !bg-transparent !text-white/60 !border !border-white/20 hover:!border-white hover:!text-white hover:!bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Torneos
          </LinkButton>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge className={status.class}>{status.label}</Badge>
            <Badge variant="outline" className="text-white/60 border-white/20">
              {categoryLabels[tournament.category] ?? tournament.category}
            </Badge>
            <Badge variant="outline" className="text-white/60 border-white/20">
              {scheduleLabels[tournament.schedule] ?? tournament.schedule}
            </Badge>
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.85]">
            {tournament.name}
          </h1>
          <p className="mt-3 text-white/40 text-sm">
            {tournament.teams.length} equipos &middot; {tournament.venue.name}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <TournamentTabs
          sede={sede}
          slug={slug}
          matches={tournament.matches.map((m) => ({
            id: m.id,
            matchDay: m.matchDay,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            date: m.date?.toISOString() ?? null,
            time: m.time,
            fieldNumber: m.fieldNumber,
            groupName: m.groupName,
            status: m.status,
            events: m.events.map((e) => ({
              id: e.id,
              type: e.type,
              minute: e.minute,
              playerName: e.player.name,
              teamId: e.teamId,
            })),
          }))}
          standings={tournament.standings.map((s) => ({
            teamId: s.team.id,
            teamName: s.team.name,
            groupName: s.groupName,
            points: s.points,
            gamesPlayed: s.gamesPlayed,
            wins: s.wins,
            draws: s.draws,
            losses: s.losses,
            goalsFor: s.goalsFor,
            goalsAgainst: s.goalsAgainst,
            goalDifference: s.goalDifference,
          }))}
          teams={teams}
          groups={groups}
          topScorers={topScorers.slice(0, 20)}
          cardSummary={cardSummary.slice(0, 20)}
        />
      </div>
    </>
  );
}
