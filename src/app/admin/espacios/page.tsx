import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Megaphone, PartyPopper, DollarSign, MapPin, User, CreditCard, RefreshCw } from "lucide-react";
import { CreateSpaceButton, EditSpaceButton } from "@/components/admin/space-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubscriptionButton } from "@/components/admin/space-subscription";
import { deleteSpace } from "@/app/admin/actions";

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
  const [spaces, venues] = await Promise.all([
    prisma.commercialSpace.findMany({
      include: { venue: true },
      orderBy: [{ status: "asc" }, { type: "asc" }],
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
  ]);

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
            {available} disponibles &middot; {rented} rentados
          </p>
        </div>
        <CreateSpaceButton venues={venues} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => {
          const Icon = typeIcons[space.type] ?? Store;
          const spaceData = {
            id: space.id,
            venueId: space.venueId,
            type: space.type,
            label: space.label,
            price: space.price,
            contractMonths: space.contractMonths,
            status: space.status,
            tenantName: space.tenantName,
            tenantPhone: space.tenantPhone,
            tenantEmail: space.tenantEmail,
          };
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
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      className={
                        space.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {space.status === "AVAILABLE" ? "Disponible" : "Rentado"}
                    </Badge>
                    <EditSpaceButton venues={venues} space={spaceData} />
                    <DeleteButton
                      label="espacio"
                      onDelete={deleteSpace.bind(null, space.id)}
                    />
                  </div>
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
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{space.tenantName}</p>
                      {space.tenantPhone && (
                        <p className="text-xs text-muted-foreground">{space.tenantPhone}</p>
                      )}
                    </div>
                  </div>
                )}
                {/* Subscription */}
                {space.status === "RENTED" && (
                  <div className="mt-3">
                    {space.stripeSubscriptionId ? (
                      <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="font-medium">Suscripcion activa</span>
                        <span className="text-emerald-600/60 ml-auto text-[10px] font-mono truncate max-w-[120px]">
                          {space.stripeSubscriptionId}
                        </span>
                      </div>
                    ) : space.tenantEmail && space.venue.stripeOnboarded ? (
                      <SubscriptionButton spaceId={space.id} label={space.label ?? typeLabels[space.type]} price={space.price} />
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        {!space.tenantEmail ? "Agrega email del inquilino para suscripcion" : "Conecta Stripe en la sede"}
                      </p>
                    )}
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
