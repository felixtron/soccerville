import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Clock, DollarSign, Car, ShowerHead, Lightbulb, MapPin, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Cancha",
  description: "Renta de cancha de futbol 7 por $550/hora. Estacionamiento, banos, vestidores y alumbrado incluido.",
};

const included = [
  { icon: Car, label: "Estacionamiento gratuito" },
  { icon: ShowerHead, label: "Banos y vestidores" },
  { icon: Lightbulb, label: "Alumbrado nocturno" },
  { icon: Zap, label: "Pasto sintetico pro" },
];

const venues = [
  { name: "Metepec", price: 550, whatsapp: "5215551234567", address: "Metepec, Estado de Mexico" },
  { name: "Calimaya", price: 550, whatsapp: "5215551234567", address: "Calimaya, Estado de Mexico" },
];

export default function ReservarPage() {
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
            Cancha de futbol 7 con pasto sintetico de calidad profesional. Reserva tu horario y llega a jugar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* Price card */}
        <div className="bg-gradient-to-br from-primary to-emerald-700 text-white rounded-3xl p-8 md:p-12 text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-3">Precio por hora</p>
          <p className="font-display text-7xl md:text-9xl leading-none tracking-tight">
            $550
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

        {/* Venues */}
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          {venues.map((venue) => (
            <Card key={venue.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="font-display text-2xl uppercase tracking-tight">
                    {venue.name}
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{venue.address}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-5">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">${venue.price.toLocaleString()}/hora</span>
                </div>
                <LinkButton
                  href={`https://wa.me/${venue.whatsapp}?text=${encodeURIComponent(`Hola! Quiero reservar cancha en la sede ${venue.name}`)}`}
                  target="_blank"
                  className="w-full rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
                >
                  Reservar por WhatsApp
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-center mb-8">
            Como funciona
          </h2>
          <div className="space-y-5">
            {[
              "Contactanos por WhatsApp con tu sede, fecha y horario preferido",
              "Confirmamos disponibilidad y apartas con tu pago",
              "Llega a la cancha y disfruta tu partido",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white font-display text-xl">
                  {i + 1}
                </div>
                <p className="pt-2 text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
