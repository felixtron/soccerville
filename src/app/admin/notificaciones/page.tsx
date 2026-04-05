import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Megaphone, Users, Trophy, MapPin, GraduationCap } from "lucide-react";
import { NotificationForm } from "@/components/admin/notification-form";
import { DeleteNotificationButton } from "@/components/admin/delete-notification-button";

export const dynamic = "force-dynamic";

const audienceLabels: Record<string, { label: string; class: string; icon: typeof Bell }> = {
  ALL: { label: "Todos", class: "bg-purple-500/10 text-purple-600", icon: Megaphone },
  VENUE: { label: "Sede", class: "bg-blue-500/10 text-blue-600", icon: MapPin },
  TOURNAMENT: { label: "Torneo", class: "bg-amber-500/10 text-amber-700", icon: Trophy },
  TEAM: { label: "Equipo", class: "bg-emerald-500/10 text-emerald-700", icon: Users },
  SCHOOL: { label: "Escuela", class: "bg-orange-500/10 text-orange-600", icon: GraduationCap },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificacionesPage() {
  const [notifications, venues, tournaments, teams, programs] = await Promise.all([
    prisma.notification.findMany({
      include: {
        author: { select: { name: true } },
        venue: { select: { name: true } },
        tournament: { select: { name: true } },
        team: { select: { name: true } },
        program: { select: { name: true } },
        _count: { select: { reads: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.venue.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.tournament.findMany({
      where: { status: { in: ["IN_PROGRESS", "OPEN", "FULL"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.program.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envia avisos y noticias a capitanes de equipo
          </p>
        </div>
        <NotificationForm venues={venues} tournaments={tournaments} teams={teams} programs={programs} />
      </div>

      {notifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay notificaciones enviadas</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Usa el boton "Nueva Notificacion" para enviar un aviso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const audience = audienceLabels[n.audience] ?? audienceLabels.ALL;
            const AudienceIcon = audience.icon;
            const target =
              n.audience === "VENUE"
                ? n.venue?.name
                : n.audience === "TOURNAMENT"
                ? n.tournament?.name
                : n.audience === "TEAM"
                ? n.team?.name
                : n.audience === "SCHOOL"
                ? n.program?.name
                : null;

            return (
              <Card key={n.id} className="border-0 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className={`h-9 w-9 rounded-full ${audience.class} flex items-center justify-center shrink-0 mt-0.5`}>
                        <AudienceIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{n.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">
                          {n.body}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={`text-[10px] ${audience.class}`}>
                            {audience.label}
                            {target && `: ${target}`}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(n.createdAt)} · {n.author.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            · {n._count.reads} leida{n._count.reads !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DeleteNotificationButton id={n.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
