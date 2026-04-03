import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  Trophy,
  Users,
  CalendarDays,
  Store,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    tournamentsCount,
    teamsCount,
    bookingsCount,
    spacesCount,
    venuesCount,
    openTournaments,
    recentBookings,
  ] = await Promise.all([
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.booking.count(),
    prisma.commercialSpace.count({ where: { status: "RENTED" } }),
    prisma.venue.count(),
    prisma.tournament.findMany({
      where: { status: "OPEN" },
      include: { venue: true, _count: { select: { teams: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      include: { venue: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    tournamentsCount,
    teamsCount,
    bookingsCount,
    spacesCount,
    venuesCount,
    openTournaments,
    recentBookings,
  };
}

export default async function AdminDashboard() {
  const session = await auth();
  const stats = await getStats();

  const cards = [
    {
      label: "Torneos",
      value: stats.tournamentsCount,
      icon: Trophy,
      href: "/admin/torneos",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Equipos",
      value: stats.teamsCount,
      icon: Users,
      href: "/admin/equipos",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Reservas",
      value: stats.bookingsCount,
      icon: CalendarDays,
      href: "/admin/reservas",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Espacios Rentados",
      value: stats.spacesCount,
      icon: Store,
      href: "/admin/espacios",
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bienvenido, {session?.user?.name ?? "Admin"} — {stats.venuesCount} sedes activas
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <LinkButton
            key={card.label}
            href={card.href}
            className="!bg-white !text-foreground !border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-0 h-auto block"
          >
            <Card className="border-0 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p className="font-display text-3xl tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  {card.label}
                </p>
              </CardContent>
            </Card>
          </LinkButton>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Open Tournaments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl uppercase tracking-tight">
                Torneos Abiertos
              </CardTitle>
              <LinkButton
                href="/admin/torneos"
                variant="link"
                className="text-xs text-primary"
              >
                Ver todos &rarr;
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            {stats.openTournaments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay torneos abiertos
              </p>
            ) : (
              <div className="space-y-3">
                {stats.openTournaments.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa]"
                  >
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {t.venue.name.replace("Soccerville ", "")}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className="bg-amber-100 text-amber-700 text-xs"
                    >
                      {(t as any)._count.teams}/{t.maxTeams}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl uppercase tracking-tight">
                Reservas Recientes
              </CardTitle>
              <LinkButton
                href="/admin/reservas"
                variant="link"
                className="text-xs text-primary"
              >
                Ver todas &rarr;
              </LinkButton>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay reservas recientes
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#fafafa]"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {b.customerName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {b.startTime} - {b.endTime}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        b.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {b.status === "CONFIRMED"
                        ? "Confirmada"
                        : b.status === "CANCELLED"
                        ? "Cancelada"
                        : "Pendiente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
