import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, DollarSign, Gavel, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { InscriptionButton } from "@/components/captain/inscription-button";

export const dynamic = "force-dynamic";

const scheduleLabels: Record<string, string> = {
  NOCTURNO: "Nocturno",
  VESPERTINO: "Vespertino",
  MATUTINO: "Matutino",
  SABATINO: "Sabatino",
  DOMINICAL: "Dominical",
};

const categoryLabels: Record<string, string> = {
  VARONIL: "Varonil",
  FEMENIL: "Femenil",
  VETERANOS: "Veteranos",
  MIXTO: "Mixto",
};

export default async function InscribirsePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  if (role === "ADMIN" || role === "OPERATOR") redirect("/admin/dashboard");

  const team = await prisma.team.findUnique({
    where: { captainId: userId },
    include: {
      tournaments: { select: { tournamentId: true, inscriptionPaid: true } },
    },
  });

  if (!team) redirect("/mi-equipo");

  const enrolledIds = team.tournaments.map((t) => t.tournamentId);

  // Get open tournaments the team is NOT enrolled in
  const availableTournaments = await prisma.tournament.findMany({
    where: {
      status: { in: ["OPEN", "FULL"] },
      id: { notIn: enrolledIds },
    },
    include: {
      venue: { select: { id: true, name: true, slug: true, stripeOnboarded: true } },
      _count: { select: { teams: true } },
    },
    orderBy: [{ venue: { name: "asc" } }, { name: "asc" }],
  });

  // Get tournaments the team IS enrolled in (to show payment status)
  const enrolledTournaments = await prisma.tournament.findMany({
    where: { id: { in: enrolledIds } },
    include: {
      venue: { select: { id: true, name: true, slug: true, stripeOnboarded: true } },
      _count: { select: { teams: true } },
    },
  });

  const enrolledMap = new Map(
    team.tournaments.map((t) => [t.tournamentId, t.inscriptionPaid])
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-5xl px-4 pt-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/images/soccerville-w.svg" alt="Soccerville" width={28} height={28} className="h-6 w-6 object-contain" />
            <span className="font-display text-sm uppercase tracking-tight hidden sm:inline">Soccerville</span>
          </Link>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link href="/mi-equipo" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Mi Equipo
          </Link>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Inscribirse a Torneo
          </h1>
          <p className="text-white/40 text-sm mt-1">{team.name}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Enrolled tournaments — payment status */}
        {enrolledTournaments.length > 0 && (
          <section>
            <h2 className="font-display text-xl uppercase tracking-tight mb-4">
              Mis Inscripciones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {enrolledTournaments.map((t) => {
                const paid = enrolledMap.get(t.id);
                return (
                  <Card key={t.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.venue.name}</p>
                        </div>
                        {paid ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Pagado</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-100 text-amber-700">Pendiente</Badge>
                            {t.venue.stripeOnboarded && (
                              <InscriptionButton
                                tournamentId={t.id}
                                teamId={team.id}
                                venueId={t.venue.id}
                                amount={t.inscriptionFee}
                                tournamentName={t.name}
                                venueName={t.venue.name}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Available tournaments */}
        <section>
          <h2 className="font-display text-xl uppercase tracking-tight mb-4">
            Torneos Disponibles
          </h2>
          {availableTournaments.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay torneos disponibles para inscripcion.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableTournaments.map((t) => {
                const remaining = t.maxTeams - t._count.teams;
                const isFull = remaining <= 0;
                return (
                  <Card key={t.id} className={`border-0 shadow-sm ${isFull ? "opacity-60" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        {isFull ? (
                          <Badge className="bg-red-100 text-red-700">Lleno</Badge>
                        ) : remaining <= 3 ? (
                          <Badge className="bg-amber-100 text-amber-700 animate-pulse">
                            {remaining} lugar{remaining !== 1 ? "es" : ""}!
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {t._count.teams}/{t.maxTeams}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {t.venue.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {scheduleLabels[t.schedule]} · {categoryLabels[t.category]}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          Inscripcion: ${t.inscriptionFee.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Gavel className="h-3.5 w-3.5" />
                          Arbitraje: ${t.refereeFee.toLocaleString()}
                          {t.refereeFeePerMatch && (
                            <span className="text-xs text-amber-600 font-medium">/partido · efectivo</span>
                          )}
                        </div>
                      </div>
                      {!isFull && (
                        <InscriptionButton
                          tournamentId={t.id}
                          teamId={team.id}
                          venueId={t.venue.id}
                          amount={t.inscriptionFee}
                          tournamentName={t.name}
                          venueName={t.venue.name}
                          stripeEnabled={t.venue.stripeOnboarded}
                          enroll
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
