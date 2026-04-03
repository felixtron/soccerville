import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Users, DollarSign, Gavel, Clock } from "lucide-react";
import type { Metadata } from "next";

type TournamentData = {
  name: string;
  schedule: string;
  category: string;
  maxTeams: number;
  currentTeams: number;
  inscriptionFee: number;
  refereeFee: number;
  status: "full" | "open" | "upcoming";
  days?: string;
};

type VenueData = {
  name: string;
  tournaments: TournamentData[];
};

const venueData: Record<string, VenueData> = {
  metepec: {
    name: "Metepec",
    tournaments: [
      { name: "Intersemanal Nocturno", schedule: "Nocturno", category: "Varonil", maxTeams: 24, currentTeams: 24, inscriptionFee: 1000, refereeFee: 550, status: "full", days: "Entre semana" },
      { name: "Intersemanal Vespertino", schedule: "Vespertino", category: "Varonil", maxTeams: 8, currentTeams: 8, inscriptionFee: 1000, refereeFee: 550, status: "full", days: "Entre semana" },
      { name: "Sabatino", schedule: "Sabatino", category: "Varonil", maxTeams: 12, currentTeams: 12, inscriptionFee: 800, refereeFee: 450, status: "full", days: "Sabados" },
      { name: "Dominical", schedule: "Dominical", category: "Varonil", maxTeams: 12, currentTeams: 10, inscriptionFee: 800, refereeFee: 450, status: "open", days: "Domingos" },
      { name: "Femenil", schedule: "Por definir", category: "Femenil", maxTeams: 12, currentTeams: 0, inscriptionFee: 800, refereeFee: 450, status: "upcoming" },
      { name: "Veteranos", schedule: "Por definir", category: "Veteranos", maxTeams: 12, currentTeams: 0, inscriptionFee: 800, refereeFee: 450, status: "upcoming" },
    ],
  },
  calimaya: {
    name: "Calimaya",
    tournaments: [
      { name: "Intersemanal", schedule: "Intersemanal", category: "Varonil", maxTeams: 24, currentTeams: 19, inscriptionFee: 800, refereeFee: 550, status: "open", days: "Entre semana" },
      { name: "Sabatino", schedule: "Sabatino", category: "Varonil", maxTeams: 12, currentTeams: 0, inscriptionFee: 600, refereeFee: 400, status: "upcoming", days: "Sabados" },
      { name: "Femenil Sabatino", schedule: "Sabatino", category: "Femenil", maxTeams: 12, currentTeams: 0, inscriptionFee: 600, refereeFee: 400, status: "upcoming", days: "Sabados" },
      { name: "Dominical Vespertino", schedule: "Dominical", category: "Varonil", maxTeams: 12, currentTeams: 0, inscriptionFee: 600, refereeFee: 400, status: "upcoming", days: "Domingos" },
    ],
  },
};

function getStatusBadge(status: TournamentData["status"], current: number, max: number) {
  switch (status) {
    case "full":
      return <Badge className="bg-red-500/10 text-red-600 border-red-200">Lleno {current}/{max}</Badge>;
    case "open": {
      const remaining = max - current;
      return (
        <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 animate-pulse">
          {remaining === 1 ? "Ultimo lugar!" : `${remaining} lugares!`} {current}/{max}
        </Badge>
      );
    }
    case "upcoming":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Pre-registro</Badge>;
  }
}

export async function generateStaticParams() {
  return [{ sede: "metepec" }, { sede: "calimaya" }];
}

export async function generateMetadata({ params }: { params: Promise<{ sede: string }> }): Promise<Metadata> {
  const { sede } = await params;
  const venue = venueData[sede];
  if (!venue) return {};
  return { title: `Torneos en ${venue.name}`, description: `Torneos de futbol 7 en ${venue.name}. Inscribete ahora.` };
}

export default async function TorneosPage({ params }: { params: Promise<{ sede: string }> }) {
  const { sede } = await params;
  const venue = venueData[sede];
  if (!venue) notFound();

  const full = venue.tournaments.filter((t) => t.status === "full");
  const open = venue.tournaments.filter((t) => t.status === "open");
  const upcoming = venue.tournaments.filter((t) => t.status === "upcoming");
  const otherSede = sede === "metepec" ? "calimaya" : "metepec";
  const otherName = sede === "metepec" ? "Calimaya" : "Metepec";

  return (
    <>
      {/* Page header */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">
            Sede {venue.name}
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
        {/* Open - Urgency */}
        {open.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Ultimos Lugares
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {open.map((t) => (
                <TournamentCard key={t.name} tournament={t} showCta />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                Proximos Torneos
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((t) => (
                <TournamentCard key={t.name} tournament={t} showCta />
              ))}
            </div>
          </section>
        )}

        {/* Full - Social Proof */}
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
                <TournamentCard key={t.name} tournament={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function TournamentCard({ tournament: t, showCta = false }: { tournament: TournamentData; showCta?: boolean }) {
  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow ${t.status === "open" ? "ring-2 ring-amber-400" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-display text-xl uppercase tracking-tight">
            {t.name}
          </CardTitle>
          {getStatusBadge(t.status, t.currentTeams, t.maxTeams)}
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          {t.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {t.days && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t.days} - {t.schedule}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            {t.maxTeams} equipos
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
        {showCta && (
          <LinkButton
            href={`https://wa.me/5215551234567?text=${encodeURIComponent(`Hola! Me interesa inscribirme al torneo ${t.name}`)}`}
            target="_blank"
            className="w-full mt-5 rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
          >
            {t.status === "upcoming" ? "Pre-registrarme" : "Apartar Lugar por WhatsApp"}
          </LinkButton>
        )}
      </CardContent>
    </Card>
  );
}
