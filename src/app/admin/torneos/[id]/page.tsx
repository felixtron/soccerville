import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, Calendar, Trophy, CheckCircle } from "lucide-react";
import {
  GenerateFixturesButton,
  EnrollTeamButton,
  UnenrollTeamButton,
  StandingsTable,
} from "@/components/admin/tournament-detail";
import { TournamentDashboard } from "@/components/admin/tournament-dashboard";

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
  const playedCount = tournament.matches.filter((m) => m.status === "PLAYED" || m.status === "DEFAULTED").length;
  const totalMatches = tournament.matches.length;

  // Workflow
  const steps = [
    { label: "Equipos", done: tournament.teams.length >= 2, active: tournament.status === "OPEN" || tournament.status === "FULL", detail: `${tournament.teams.length}/${tournament.maxTeams}` },
    { label: "Fixtures", done: hasMatches, active: !hasMatches && tournament.teams.length >= 2, detail: hasMatches ? `${totalMatches}` : "—" },
    { label: "Resultados", done: tournament.status === "FINISHED", active: tournament.status === "IN_PROGRESS", detail: hasMatches ? `${playedCount}/${totalMatches}` : "—" },
    { label: "Fin", done: tournament.status === "FINISHED", active: false, detail: "" },
  ];

  // Serialize matches for client component
  const matchesData = tournament.matches.map((m) => ({
    id: m.id,
    matchDay: m.matchDay,
    homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, players: m.homeTeam.players },
    awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, players: m.awayTeam.players },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
    events: m.events.map((e) => ({
      id: e.id,
      type: e.type,
      minute: e.minute,
      playerId: e.playerId,
      teamId: e.teamId,
      player: { name: e.player.name },
    })),
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
              <h1 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                {tournament.name}
              </h1>
              <Badge className={status.class}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {tournament.venue.name.replace("Soccerville ", "")}
              </span>
              <Badge variant="outline" className="text-[10px]">{tournament.category}</Badge>
              <Badge variant="outline" className="text-[10px]">{tournament.schedule}</Badge>
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

      {/* Compact workflow */}
      <div className="flex items-center gap-1 mb-6 p-3 rounded-xl bg-white shadow-sm">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
              step.done ? "bg-emerald-500 text-white" :
              step.active ? "bg-blue-500 text-white animate-pulse" :
              "bg-gray-100 text-gray-400"
            }`}>
              {step.done ? <CheckCircle className="h-3 w-3" /> : i + 1}
            </div>
            <div className="ml-1.5 min-w-0 hidden md:block">
              <p className={`text-[10px] font-medium leading-tight ${step.done ? "text-emerald-700" : step.active ? "text-blue-700" : "text-gray-400"}`}>
                {step.label}
              </p>
              {step.detail && <p className="text-[9px] text-muted-foreground">{step.detail}</p>}
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 mx-2 ${step.done ? "bg-emerald-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Main content — client component with tabs */}
      <TournamentDashboard
        matches={matchesData}
        teams={tournament.teams.map((tt) => ({
          id: tt.team.id,
          name: tt.team.name,
          captainName: tt.team.captain.name,
          inscriptionPaid: tt.inscriptionPaid,
        }))}
        standings={tournament.standings.map((s) => ({
          team: s.team,
          points: s.points,
          gamesPlayed: s.gamesPlayed,
          wins: s.wins,
          draws: s.draws,
          losses: s.losses,
          goalsFor: s.goalsFor,
          goalsAgainst: s.goalsAgainst,
          goalDifference: s.goalDifference,
        }))}
        tournamentId={tournament.id}
        hasMatches={hasMatches}
        teamCount={tournament.teams.length}
      />
    </>
  );
}
