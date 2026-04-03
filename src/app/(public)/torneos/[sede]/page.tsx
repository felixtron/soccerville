import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Users, DollarSign, Gavel, Clock, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

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

function getStatusBadge(status: string, current: number, max: number) {
  switch (status) {
    case "FULL":
      return <Badge className="bg-red-500/10 text-red-600 border-red-200">Lleno {current}/{max}</Badge>;
    case "OPEN": {
      const remaining = max - current;
      return (
        <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 animate-pulse">
          {remaining <= 3 ? `${remaining} lugares!` : `${current}/${max}`}
        </Badge>
      );
    }
    case "IN_PROGRESS":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">En curso</Badge>;
    case "FINISHED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200">Finalizado</Badge>;
    default:
      return null;
  }
}

export async function generateStaticParams() {
  return [{ sede: "metepec" }, { sede: "calimaya" }];
}

export async function generateMetadata({ params }: { params: Promise<{ sede: string }> }): Promise<Metadata> {
  const { sede } = await params;
  const venue = await prisma.venue.findUnique({ where: { slug: sede }, select: { name: true } });
  if (!venue) return {};
  const name = venue.name.replace("Soccerville ", "");
  return { title: `Torneos en ${name}`, description: `Torneos de futbol 7 en ${name}. Inscribete ahora.` };
}

export default async function TorneosPage({ params }: { params: Promise<{ sede: string }> }) {
  const { sede } = await params;

  const venue = await prisma.venue.findUnique({
    where: { slug: sede },
    include: {
      tournaments: {
        include: {
          _count: { select: { teams: true } },
          standings: {
            include: { team: { select: { name: true } } },
            orderBy: [{ points: "desc" }, { goalDifference: "desc" }],
            take: 5,
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!venue) notFound();

  const venueName = venue.name.replace("Soccerville ", "");
  const otherSede = sede === "metepec" ? "calimaya" : "metepec";
  const otherName = sede === "metepec" ? "Calimaya" : "Metepec";

  const open = venue.tournaments.filter((t) => t.status === "OPEN");
  const inProgress = venue.tournaments.filter((t) => t.status === "IN_PROGRESS");
  const full = venue.tournaments.filter((t) => t.status === "FULL");
  const finished = venue.tournaments.filter((t) => t.status === "FINISHED");

  return (
    <>
      {/* Page header */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Sede {venueName}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.85]">
            Torneos
          </h1>
          <p className="mt-4 text-white/50 max-w-md">
            Futbol 7 competitivo. Inscribete a tu torneo ideal.
          </p>
          <div className="mt-6">
            <LinkButton
              href={`/torneos/${otherSede}`}
              size="sm"
              className="rounded-full !bg-transparent !text-white !border !border-white/30 hover:!border-white hover:!bg-white/10"
            >
              Ver {otherName} &rarr;
            </LinkButton>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16 space-y-12">
        {/* In Progress - with standings */}
        {inProgress.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Torneos en Curso
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {inProgress.map((t) => (
                <TournamentCard key={t.id} tournament={t} showStandings sede={sede} />
              ))}
            </div>
          </section>
        )}

        {/* Open - Urgency */}
        {open.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Inscripciones Abiertas
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {open.map((t) => (
                <TournamentCard key={t.id} tournament={t} showCta venueWhatsapp={venue.whatsapp} sede={sede} />
              ))}
            </div>
          </section>
        )}

        {/* Full */}
        {full.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Torneos Llenos
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Estos torneos ya estan completos. Se llenan rapido!
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {full.map((t) => (
                <TournamentCard key={t.id} tournament={t} sede={sede} />
              ))}
            </div>
          </section>
        )}

        {/* Finished */}
        {finished.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-3 w-3 rounded-full bg-gray-400" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Torneos Finalizados
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finished.map((t) => (
                <TournamentCard key={t.id} tournament={t} showStandings sede={sede} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

type TournamentWithCounts = {
  id: string;
  name: string;
  slug: string;
  category: string;
  schedule: string;
  maxTeams: number;
  inscriptionFee: number;
  refereeFee: number;
  status: string;
  _count: { teams: number };
  standings: {
    team: { name: string };
    points: number;
    gamesPlayed: number;
    goalDifference: number;
  }[];
};

function TournamentCard({
  tournament: t,
  showCta = false,
  showStandings = false,
  venueWhatsapp,
  sede,
}: {
  tournament: TournamentWithCounts;
  showCta?: boolean;
  showStandings?: boolean;
  venueWhatsapp?: string;
  sede?: string;
}) {
  const teamCount = t._count.teams;
  const isOpen = t.status === "OPEN";

  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow ${isOpen && (t.maxTeams - teamCount) <= 3 ? "ring-2 ring-amber-400" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-display text-xl uppercase tracking-tight">
            {t.name}
          </CardTitle>
          {getStatusBadge(t.status, teamCount, t.maxTeams)}
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          {categoryLabels[t.category] ?? t.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {scheduleLabels[t.schedule] ?? t.schedule}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            {teamCount}/{t.maxTeams} equipos
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Inscripcion: ${t.inscriptionFee.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gavel className="h-4 w-4" />
            Arbitraje: ${t.refereeFee.toLocaleString()}
          </div>
        </div>

        {/* Mini standings */}
        {showStandings && t.standings.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-[#fafafa]">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tabla
              </span>
            </div>
            <div className="space-y-1">
              {t.standings.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span>
                    <span className="font-bold text-muted-foreground w-4 inline-block">{i + 1}.</span>{" "}
                    {s.team.name}
                  </span>
                  <span className="font-bold">{s.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to tournament detail */}
        {sede && (t.status === "IN_PROGRESS" || t.status === "FINISHED") && (
          <Link
            href={`/torneos/${sede}/${t.slug}`}
            className="flex items-center justify-between mt-4 p-2.5 rounded-lg bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors text-sm font-medium"
          >
            <span>Ver calendario y posiciones</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}

        {showCta && venueWhatsapp && (
          <LinkButton
            href={`https://wa.me/${venueWhatsapp}?text=${encodeURIComponent(`Hola! Me interesa inscribirme al torneo ${t.name}`)}`}
            target="_blank"
            className="w-full mt-5 rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
          >
            Apartar Lugar por WhatsApp
          </LinkButton>
        )}
      </CardContent>
    </Card>
  );
}
