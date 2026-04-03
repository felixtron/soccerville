import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign, Gavel } from "lucide-react";
import { CreateTournamentButton, EditTournamentButton } from "@/components/admin/tournament-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTournament } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Abierto", class: "bg-emerald-100 text-emerald-700" },
  FULL: { label: "Lleno", class: "bg-red-100 text-red-700" },
  IN_PROGRESS: { label: "En curso", class: "bg-blue-100 text-blue-700" },
  FINISHED: { label: "Finalizado", class: "bg-gray-100 text-gray-600" },
};

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

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Torneos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tournaments.length} torneos registrados
          </p>
        </div>
        <CreateTournamentButton venues={venues} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((t) => {
          const status = statusMap[t.status] ?? statusMap.OPEN;
          const tournamentData = {
            id: t.id,
            name: t.name,
            venueId: t.venueId,
            category: t.category,
            schedule: t.schedule,
            maxTeams: t.maxTeams,
            inscriptionFee: t.inscriptionFee,
            refereeFee: t.refereeFee,
            status: t.status,
            startDate: t.startDate ? t.startDate.toISOString().split("T")[0] : null,
          };
          return (
            <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-xl uppercase tracking-tight">
                    <Link href={`/admin/torneos/${t.id}`} className="hover:text-primary transition-colors">
                      {t.name}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge className={status.class}>{status.label}</Badge>
                    <EditTournamentButton venues={venues} tournament={tournamentData} />
                    <DeleteButton
                      label="torneo"
                      onDelete={deleteTournament.bind(null, t.id)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {t.venue.name.replace("Soccerville ", "")}
                  <span className="mx-1">&middot;</span>
                  <Badge variant="outline" className="text-[10px]">
                    {t.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#fafafa] rounded-xl p-2.5">
                    <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="font-bold text-sm">
                      {(t as any)._count.teams}/{t.maxTeams}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Equipos</p>
                  </div>
                  <div className="bg-[#fafafa] rounded-xl p-2.5">
                    <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="font-bold text-sm">
                      ${t.inscriptionFee.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Inscripcion</p>
                  </div>
                  <div className="bg-[#fafafa] rounded-xl p-2.5">
                    <Gavel className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="font-bold text-sm">
                      ${t.refereeFee.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Arbitraje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
