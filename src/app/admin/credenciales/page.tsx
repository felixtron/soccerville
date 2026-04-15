import { prisma } from "@/lib/prisma";
import { CredencialesPanel } from "@/components/admin/credenciales-panel";
import { IdCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CredencialesAdmin() {
  const teams = await prisma.team.findMany({
    include: {
      captain: { select: { name: true, email: true, phone: true } },
      players: {
        orderBy: { number: "asc" },
        select: {
          id: true,
          name: true,
          number: true,
          position: true,
          photo: true,
        },
      },
      tournaments: {
        take: 1,
        orderBy: { enrolledAt: "desc" },
        include: { tournament: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const teamData = teams.map((t) => ({
    id: t.id,
    name: t.name,
    logoUrl: t.logoUrl,
    captain: t.captain,
    tournamentName: t.tournaments[0]?.tournament.name ?? null,
    players: t.players,
  }));

  const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
  const withPhoto = teams.reduce(
    (sum, t) => sum + t.players.filter((p) => p.photo).length,
    0
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight flex items-center gap-3">
            <IdCard className="h-8 w-8" />
            Credenciales
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalPlayers} jugadores · {withPhoto} con foto ({totalPlayers > 0 ? Math.round((withPhoto / totalPlayers) * 100) : 0}%)
          </p>
        </div>
      </div>

      <CredencialesPanel teams={teamData} />
    </>
  );
}
