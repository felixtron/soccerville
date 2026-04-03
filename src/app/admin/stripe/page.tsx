import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, MapPin, DollarSign } from "lucide-react";
const PLATFORM_FEE_PERCENT = 5;
import { StripeConnectButton, StripeDashboardLink } from "@/components/admin/stripe-connect";

export const dynamic = "force-dynamic";

export default async function StripePage() {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stripeAccountId: true,
      stripeOnboarded: true,
    },
    orderBy: { name: "asc" },
  });

  const payments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true, applicationFee: true },
  });

  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalFees = payments.reduce((sum, p) => sum + p.applicationFee, 0);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
          Stripe Connect
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pagos en linea con {PLATFORM_FEE_PERCENT}% de comision de plataforma
        </p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="font-display text-2xl">${totalVolume.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Volumen total
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="font-display text-2xl">${totalFees.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Comision Prosuite ({PLATFORM_FEE_PERCENT}%)
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="font-display text-2xl">{payments.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Pagos completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Venue accounts */}
      <h2 className="font-display text-xl uppercase tracking-tight mb-4">
        Cuentas por Sede
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {venues.map((venue) => (
          <Card key={venue.id} className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {venue.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {venue.slug}
                    </span>
                  </div>
                </div>
                {venue.stripeOnboarded ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activa
                  </Badge>
                ) : venue.stripeAccountId ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600">
                    No conectada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {venue.stripeOnboarded ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Cuenta: <code className="text-xs">{venue.stripeAccountId}</code>
                  </p>
                  <StripeDashboardLink accountId={venue.stripeAccountId!} />
                </div>
              ) : (
                <StripeConnectButton venueId={venue.id} venueName={venue.name} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
