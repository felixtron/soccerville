import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Banknote, MapPin } from "lucide-react";
import { MarkCashButton } from "@/components/admin/payment-actions";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; class: string }> = {
  PENDING: { label: "Pendiente", class: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completado", class: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Fallido", class: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Reembolsado", class: "bg-purple-100 text-purple-700" },
};

const typeLabels: Record<string, string> = {
  INSCRIPTION: "Inscripcion",
  REFEREE: "Arbitraje",
  BOOKING: "Reserva",
  FOODTRUCK: "Foodtruck",
  ADVERTISING: "Publicidad",
  EVENT: "Evento",
};

export default async function PagosAdmin() {
  const payments = await prisma.payment.findMany({
    include: { venue: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const completed = payments.filter((p) => p.status === "COMPLETED");
  const totalAmount = completed.reduce((s, p) => s + p.amount, 0);
  const totalFees = completed.reduce((s, p) => s + p.applicationFee, 0);
  const cashPayments = completed.filter((p) => !p.stripePaymentId);
  const onlinePayments = completed.filter((p) => p.stripePaymentId);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Pagos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {payments.length} pagos registrados
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total cobrado</p>
            <p className="font-display text-2xl mt-1">${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Comision Prosuite</p>
            <p className="font-display text-2xl mt-1">${totalFees.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> En linea
            </p>
            <p className="font-display text-2xl mt-1">{onlinePayments.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Banknote className="h-3 w-3" /> Efectivo
            </p>
            <p className="font-display text-2xl mt-1">{cashPayments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment list */}
      <div className="space-y-3">
        {payments.map((p) => {
          const status = statusMap[p.status] ?? statusMap.PENDING;
          return (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {p.stripePaymentId ? (
                      <CreditCard className="h-5 w-5 text-primary" />
                    ) : p.status === "COMPLETED" ? (
                      <Banknote className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">${p.amount.toLocaleString()} MXN</p>
                      <Badge className={status.class + " text-xs"}>
                        {status.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabels[p.type] ?? p.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {p.description && <span>{p.description}</span>}
                      {p.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.venue.name.replace("Soccerville ", "")}
                        </span>
                      )}
                      {p.user && <span>{p.user.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {p.status === "PENDING" && !p.stripePaymentId && (
                    <MarkCashButton paymentId={p.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
