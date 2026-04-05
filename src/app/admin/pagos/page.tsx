import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CreditCard, Banknote, TrendingUp } from "lucide-react";
import { PaymentsTable } from "@/components/admin/payments-table";

export const dynamic = "force-dynamic";

export default async function PagosAdmin() {
  const [payments, venues] = await Promise.all([
    prisma.payment.findMany({
      include: {
        venue: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
  ]);

  const completed = payments.filter((p) => p.status === "COMPLETED");
  const totalAmount = completed.reduce((s, p) => s + p.amount, 0);
  const totalFees = completed.reduce((s, p) => s + p.applicationFee, 0);
  const onlineCount = completed.filter((p) => p.stripePaymentId).length;
  const cashCount = completed.filter((p) => !p.stripePaymentId).length;

  const serialized = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    applicationFee: p.applicationFee,
    status: p.status,
    type: p.type,
    description: p.description,
    venueName: p.venue?.name?.replace("Soccerville ", "") ?? null,
    venueId: p.venueId,
    userName: p.user?.name ?? null,
    stripePaymentId: p.stripePaymentId,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">Pagos</h1>
        <p className="text-muted-foreground text-sm mt-1">{payments.length} registros</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
            </div>
            <p className="font-display text-xl">${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prosuite 5%</span>
            </div>
            <p className="font-display text-xl">${totalFees.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">En linea</span>
            </div>
            <p className="font-display text-xl">{onlineCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-amber-600" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Efectivo</span>
            </div>
            <p className="font-display text-xl">{cashCount}</p>
          </CardContent>
        </Card>
      </div>

      <PaymentsTable payments={serialized} venues={venues} />
    </>
  );
}
