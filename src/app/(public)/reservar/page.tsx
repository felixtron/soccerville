import { prisma } from "@/lib/prisma";
import { Car, ShowerHead, Lightbulb, Zap } from "lucide-react";
import { BookingWizard } from "@/components/public/booking-wizard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservar Cancha",
  description: "Renta de cancha de futbol 7 por $550/hora. Reserva en linea y paga con tarjeta o en efectivo.",
};

const included = [
  { icon: Car, label: "Estacionamiento gratuito" },
  { icon: ShowerHead, label: "Banos y vestidores" },
  { icon: Lightbulb, label: "Alumbrado nocturno" },
  { icon: Zap, label: "Pasto sintetico pro" },
];

export default async function ReservarPage() {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      fieldRentalPrice: true,
      whatsapp: true,
      stripeOnboarded: true,
      operatingHours: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Reservaciones</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.85]">
            Reserva
            <br />
            tu cancha
          </h1>
          <p className="mt-4 text-white/50 max-w-md">
            Cancha de futbol 7 con pasto sintetico profesional. Selecciona tu horario y paga en linea.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* Price card */}
        <div className="bg-gradient-to-br from-primary to-emerald-700 text-white rounded-3xl p-8 md:p-12 text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-3">Precio por hora</p>
          <p className="font-display text-7xl md:text-9xl leading-none tracking-tight">
            ${venues[0]?.fieldRentalPrice ?? 550}
          </p>
          <p className="mt-3 text-white/70">Todo incluido, sin costos extras</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-2xl mx-auto">
            {included.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2.5">
                <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-white/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Wizard */}
        <div className="mb-16">
          <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-center mb-8">
            Reserva en linea
          </h2>
          <BookingWizard venues={venues} />
        </div>

        {/* How it works */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-center mb-8">
            Como funciona
          </h2>
          <div className="space-y-5">
            {[
              "Selecciona la sede, fecha y horario disponible",
              "Ingresa tus datos y confirma la reserva",
              "Paga con tarjeta en linea o confirma por WhatsApp",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white font-display text-xl">
                  {i + 1}
                </div>
                <p className="pt-2 text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
