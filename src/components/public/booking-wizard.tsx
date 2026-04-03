"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  MessageCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

type Venue = {
  id: string;
  name: string;
  slug: string;
  fieldRentalPrice: number;
  whatsapp: string;
  stripeOnboarded: boolean;
  operatingHours: string | null;
};

type BookedSlot = { startTime: string; endTime: string; status: string };

// Generate 1-hour time slots from 8:00 to 23:00
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 8;
  return {
    start: `${h.toString().padStart(2, "0")}:00`,
    end: `${(h + 1).toString().padStart(2, "0")}:00`,
    label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"} - ${(h + 1) > 12 ? (h + 1) - 12 : h + 1}:00 ${h + 1 >= 12 ? "PM" : "AM"}`,
  };
});

export function BookingWizard({ venues }: { venues: Venue[] }) {
  const [step, setStep] = useState(0); // 0=venue, 1=date, 2=time, 3=info, 4=confirm
  const [venueId, setVenueId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string; label: string } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [pending, startTransition] = useTransition();
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const venue = venues.find((v) => v.id === venueId);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!venueId || !selectedDate) return;
    fetch(`/api/bookings?venueId=${venueId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setBookedSlots(d.bookings || []))
      .catch(() => setBookedSlots([]));
  }, [venueId, selectedDate]);

  function isSlotBooked(start: string, end: string) {
    return bookedSlots.some((b) => b.startTime < end && b.endTime > start);
  }

  function isPastDate(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  }

  // Calendar helpers
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarMonth.year, calendarMonth.month, 1).getDay();
  const monthName = new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  async function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId,
            date: selectedDate,
            startTime: selectedSlot!.start,
            endTime: selectedSlot!.end,
            customerName: form.name,
            customerPhone: form.phone,
            customerEmail: form.email,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Error al reservar");
          return;
        }
        setBookingResult(data);
        setStep(4);
      } catch {
        setError("Error de conexion");
      }
    });
  }

  async function handlePay() {
    if (!bookingResult) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "BOOKING",
            venueId,
            amount: bookingResult.price,
            description: `Reserva cancha ${venue?.name} — ${selectedDate} ${selectedSlot?.start}-${selectedSlot?.end}`,
            metadata: { bookingId: bookingResult.booking.id },
          }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else setError(data.error || "Error al crear pago");
      } catch {
        setError("Error de conexion");
      }
    });
  }

  return (
    <Card className="border-0 shadow-lg max-w-lg mx-auto">
      {/* Step 0: Select venue */}
      {step === 0 && (
        <>
          <CardHeader>
            <CardTitle className="font-display text-xl uppercase tracking-tight">
              Selecciona sede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {venues.map((v) => (
              <button
                key={v.id}
                className="w-full p-4 rounded-xl bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors text-left flex items-center justify-between"
                onClick={() => {
                  setVenueId(v.id);
                  setStep(1);
                }}
              >
                <div>
                  <p className="font-semibold">{v.name.replace("Soccerville ", "")}</p>
                  <p className="text-sm text-muted-foreground">${v.fieldRentalPrice}/hora</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </>
      )}

      {/* Step 1: Select date */}
      {step === 1 && (
        <>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setStep(0)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="font-display text-xl uppercase tracking-tight">
                Fecha
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  const d = new Date(calendarMonth.year, calendarMonth.month - 1);
                  setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium capitalize">{monthName}</p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  const d = new Date(calendarMonth.year, calendarMonth.month + 1);
                  setCalendarMonth({ year: d.getFullYear(), month: d.getMonth() });
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
                <div key={d} className="text-center text-[10px] text-muted-foreground uppercase font-medium py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${calendarMonth.year}-${(calendarMonth.month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                const past = isPastDate(dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={day}
                    disabled={past}
                    className={`h-9 w-full rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : past
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : "hover:bg-[#f0f0f0]"
                    }`}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                      setStep(2);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </>
      )}

      {/* Step 2: Select time */}
      {step === 2 && (
        <>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="font-display text-xl uppercase tracking-tight">
                  Horario
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const booked = isSlotBooked(slot.start, slot.end);
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    disabled={booked}
                    className={`p-3 rounded-xl text-sm font-medium transition-colors text-left ${
                      isSelected
                        ? "bg-primary text-white"
                        : booked
                        ? "bg-red-50 text-red-300 cursor-not-allowed line-through"
                        : "bg-[#fafafa] hover:bg-[#f0f0f0]"
                    }`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep(3);
                    }}
                  >
                    <Clock className="h-3 w-3 inline mr-1.5" />
                    {slot.label}
                    {booked && <Badge className="ml-1 text-[9px] bg-red-100 text-red-500">Ocupado</Badge>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </>
      )}

      {/* Step 3: Customer info */}
      {step === 3 && (
        <>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="font-display text-xl uppercase tracking-tight">
                Tus datos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-[#fafafa] mb-4 text-sm">
              <p className="font-medium">{venue?.name.replace("Soccerville ", "")}</p>
              <p className="text-muted-foreground">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                — {selectedSlot?.label}
              </p>
              <p className="font-bold mt-1">${venue?.fieldRentalPrice}/hora</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="722 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <Button
              className="w-full mt-4"
              disabled={pending || !form.name || !form.phone}
              onClick={handleSubmit}
            >
              {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirmar Reserva
            </Button>
          </CardContent>
        </>
      )}

      {/* Step 4: Payment/Confirm */}
      {step === 4 && bookingResult && (
        <>
          <CardHeader>
            <CardTitle className="font-display text-xl uppercase tracking-tight text-center">
              Reserva Creada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {venue?.name.replace("Soccerville ", "")} — {selectedSlot?.label}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="font-display text-3xl mb-6">${bookingResult.price} MXN</p>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="space-y-3">
              {bookingResult.stripeEnabled && (
                <Button
                  className="w-full bg-primary"
                  disabled={pending}
                  onClick={handlePay}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pagar con tarjeta
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full !bg-emerald-50 !text-emerald-700 !border-emerald-200 hover:!bg-emerald-100"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Hola! Acabo de reservar cancha en ${venue?.name.replace("Soccerville ", "")} para el ${selectedDate} de ${selectedSlot?.start} a ${selectedSlot?.end}. Mi nombre es ${form.name}. ¿Como puedo confirmar mi pago?`
                  );
                  window.open(`https://wa.me/${venue?.whatsapp}?text=${msg}`, "_blank");
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Confirmar por WhatsApp
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4">
              Tu reserva queda pendiente hasta confirmar el pago. Reservas no confirmadas se liberan despues de 30 minutos.
            </p>
          </CardContent>
        </>
      )}
    </Card>
  );
}
