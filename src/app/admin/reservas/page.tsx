import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Phone, User } from "lucide-react";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  PENDING: { label: "Pendiente", class: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmada", class: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelada", class: "bg-red-100 text-red-700" },
};

export default async function ReservasAdmin() {
  const bookings = await prisma.booking.findMany({
    include: { venue: true },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Reservas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {bookings.length} reservas registradas
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay reservas aun.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Las reservas apareceran aqui cuando los clientes agenden.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const status = statusMap[b.status] ?? statusMap.PENDING;
            return (
              <Card key={b.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{b.customerName}</p>
                        <Badge className={status.class + " text-xs"}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {b.venue.name.replace("Soccerville ", "")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {b.startTime} - {b.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {b.customerPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground md:text-right whitespace-nowrap">
                    {new Date(b.date).toLocaleDateString("es-MX", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
