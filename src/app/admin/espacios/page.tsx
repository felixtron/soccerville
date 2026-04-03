import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Megaphone, PartyPopper, DollarSign, MapPin, User } from "lucide-react";

export const dynamic = "force-dynamic";

const typeIcons: Record<string, typeof Store> = {
  FOODTRUCK: Store,
  ADVERTISING: Megaphone,
  EVENT: PartyPopper,
};

const typeLabels: Record<string, string> = {
  FOODTRUCK: "Foodtruck",
  ADVERTISING: "Publicidad",
  EVENT: "Evento",
};

export default async function EspaciosAdmin() {
  const spaces = await prisma.commercialSpace.findMany({
    include: { venue: true },
    orderBy: [{ status: "asc" }, { type: "asc" }],
  });

  const available = spaces.filter((s) => s.status === "AVAILABLE").length;
  const rented = spaces.filter((s) => s.status === "RENTED").length;

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Espacios Comerciales
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {available} disponibles · {rented} rentados
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => {
          const Icon = typeIcons[space.type] ?? Store;
          return (
            <Card key={space.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {space.label ?? typeLabels[space.type]}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {space.venue.name.replace("Soccerville ", "")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={
                      space.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {space.status === "AVAILABLE" ? "Disponible" : "Rentado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    ${space.price.toLocaleString()}/mes
                  </span>
                  <span className="text-muted-foreground">
                    {space.contractMonths} meses
                  </span>
                </div>
                {space.tenantName && (
                  <div className="flex items-center gap-2 mt-3 text-sm p-2.5 rounded-lg bg-[#fafafa]">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{space.tenantName}</p>
                      {space.tenantPhone && (
                        <p className="text-xs text-muted-foreground">
                          {space.tenantPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
