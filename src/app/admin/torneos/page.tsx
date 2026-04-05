import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign, Gavel, Zap, Trophy, ChevronRight, Calendar } from "lucide-react";
import { CreateTournamentButton, EditTournamentButton } from "@/components/admin/tournament-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTournament } from "@/app/admin/actions";
import { TournamentFilters } from "@/components/admin/tournament-filters";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Abierto", class: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Lleno", class: "bg-amber-100 text-amber-700" },
  IN_PROGRESS: { label: "En curso", class: "bg-blue-100 text-blue-700" },
  FINISHED: { label: "Finalizado", class: "bg-gray-100 text-gray-600" },
};

function getNextStep(status: string, teamCount: number, maxTeams: number, matchCount: number) {
  if (status === "OPEN" && teamCount < maxTeams) {
    return { label: "Inscribir equipos", icon: Users, class: "text-emerald-600" };
  }
  if ((status === "OPEN" || status === "FULL") && matchCount === 0) {
    return { label: "Generar fixtures", icon: Zap, class: "text-amber-600" };
  }
  if (status === "IN_PROGRESS") {
    return { label: "Registrar resultados", icon: Trophy, class: "text-blue-600" };
  }
  if (status === "FINISHED") {
    return { label: "Torneo finalizado", icon: Trophy, class: "text-gray-400" };
  }
  return null;
}

export default async function TorneosAdmin() {
  const [tournaments, venues] = await Promise.all([
    prisma.tournament.findMany({
      include: {
        venue: true,
        _count: { select: { teams: true, matches: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
  ]);

  const serialized = tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    venueId: t.venueId,
    venueName: t.venue.name.replace("Soccerville ", ""),
    category: t.category,
    schedule: t.schedule,
    maxTeams: t.maxTeams,
    inscriptionFee: t.inscriptionFee,
    refereeFee: t.refereeFee,
    refereeFeePerMatch: t.refereeFeePerMatch,
    status: t.status,
    teamCount: t._count.teams,
    matchCount: t._count.matches,
    startDate: t.startDate ? t.startDate.toISOString().split("T")[0] : null,
  }));

  const counts = {
    open: serialized.filter((t) => t.status === "OPEN").length,
    full: serialized.filter((t) => t.status === "FULL").length,
    inProgress: serialized.filter((t) => t.status === "IN_PROGRESS").length,
    finished: serialized.filter((t) => t.status === "FINISHED").length,
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Torneos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {counts.open} abiertos &middot; {counts.full} llenos &middot;{" "}
            {counts.inProgress} en curso &middot; {counts.finished} finalizados
          </p>
        </div>
        <CreateTournamentButton venues={venues} />
      </div>

      {/* Status quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Abiertos", count: counts.open, class: "border-emerald-200 bg-emerald-50" },
          { label: "Llenos", count: counts.full, class: "border-amber-200 bg-amber-50" },
          { label: "En Curso", count: counts.inProgress, class: "border-blue-200 bg-blue-50" },
          { label: "Finalizados", count: counts.finished, class: "border-gray-200 bg-gray-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.class}`}>
            <p className="font-display text-2xl">{s.count}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <TournamentFilters
        tournaments={serialized}
        venues={venues}
        statusMap={statusMap}
      />
    </>
  );
}
