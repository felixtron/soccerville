"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  MapPin,
  Plus,
} from "lucide-react";
import { MarkCashButton } from "./payment-actions";
import { createManualPayment } from "@/app/admin/actions";

type PaymentData = {
  id: string;
  amount: number;
  applicationFee: number;
  status: string;
  type: string;
  description: string | null;
  venueName: string | null;
  venueId: string | null;
  userName: string | null;
  stripePaymentId: string | null;
  createdAt: string;
};

type Venue = { id: string; name: string };

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
  SCHOOL_FEE: "Escuela",
};

export function PaymentsTable({
  payments,
  venues,
}: {
  payments: PaymentData[];
  venues: Venue[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  const filtered = useMemo(() => {
    let result = payments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.description?.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q) ||
          p.venueName?.toLowerCase().includes(q) ||
          p.amount.toString().includes(q)
      );
    }
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (typeFilter) result = result.filter((p) => p.type === typeFilter);
    if (venueFilter) result = result.filter((p) => p.venueId === venueFilter);
    return result;
  }, [payments, search, statusFilter, typeFilter, venueFilter]);

  const hasFilters = search || statusFilter || typeFilter || venueFilter;
  const filteredTotal = filtered.reduce((s, p) => s + (p.status === "COMPLETED" ? p.amount : 0), 0);

  return (
    <div className="space-y-4">
      {/* Filters + Cash button */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descripcion, nombre, monto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Todo estado</option>
          <option value="COMPLETED">Completado</option>
          <option value="PENDING">Pendiente</option>
          <option value="FAILED">Fallido</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Todo rubro</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="">Toda sede</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name.replace("Soccerville ", "")}</option>
          ))}
        </select>
        {hasFilters && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setVenueFilter(""); }} className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground">
            Limpiar
          </button>
        )}
        <CashPaymentButton venues={venues} />
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} pagos{hasFilters && " (filtrado)"}
        </p>
        {hasFilters && filteredTotal > 0 && (
          <p className="text-xs font-medium">${filteredTotal.toLocaleString()} cobrados</p>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay pagos que mostrar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const status = statusMap[p.status] ?? statusMap.PENDING;
            const isOnline = !!p.stripePaymentId;
            return (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Icon */}
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isOnline ? "bg-purple-50" : p.status === "COMPLETED" ? "bg-emerald-50" : "bg-gray-50"
                  }`}>
                    {isOnline ? (
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    ) : p.status === "COMPLETED" ? (
                      <Banknote className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">${p.amount.toLocaleString()}</span>
                      <Badge className={`${status.class} text-[9px]`}>{status.label}</Badge>
                      <Badge variant="outline" className="text-[9px]">{typeLabels[p.type] ?? p.type}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0 mt-0.5 text-[10px] text-muted-foreground">
                      {p.description && <span className="truncate max-w-[200px]">{p.description}</span>}
                      {p.venueName && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />{p.venueName}
                        </span>
                      )}
                      {p.userName && <span>{p.userName}</span>}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {p.status === "PENDING" && !p.stripePaymentId && (
                      <MarkCashButton paymentId={p.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Cash Payment Dialog ───────────────────────────────────

function CashPaymentButton({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-500" />}>
        <Plus className="h-4 w-4 mr-1.5" />
        Pago en Efectivo
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar Pago en Efectivo</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createManualPayment(formData);
              setOpen(false);
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Rubro</Label>
              <select name="type" required className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Seleccionar...</option>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Monto $</Label>
                <Input name="amount" type="number" min="1" required placeholder="550" />
              </div>
              <div className="grid gap-2">
                <Label>Sede</Label>
                <select name="venueId" required className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name.replace("Soccerville ", "")}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Descripcion (opcional)</Label>
              <Input name="description" placeholder="Ej: Arbitraje J5 — Mineiro vs Lyon" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-500">
              {pending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
