import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquiposAdmin() {
  const teams = await prisma.team.findMany({
    include: {
      captain: { select: { name: true, email: true, phone: true } },
      _count: { select: { players: true, tournaments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Equipos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {teams.length} equipos registrados
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No hay equipos registrados aun.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Los equipos se crean cuando un capitan se inscribe a un torneo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-xl uppercase tracking-tight">
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{team.captain.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.captain.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {(team as any)._count.players} jugadores
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    {(team as any)._count.tournaments} torneos
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
