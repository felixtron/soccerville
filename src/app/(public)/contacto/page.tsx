import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { MapPin, Phone, Clock, MessageCircle, Navigation } from "lucide-react";
import { VENUES } from "@/lib/venues";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a Soccerville. Sedes en Metepec y Calimaya.",
};

const venueKeys = ["metepec", "calimaya"] as const;

export default function ContactoPage() {
  return (
    <>
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Hablemos</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.85]">
            Contacto
          </h1>
          <p className="mt-4 text-white/50 max-w-md">
            Estamos para ayudarte. Escribenos por WhatsApp para respuesta inmediata.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        {/* WhatsApp CTA */}
        <div className="bg-[#25D366] text-white rounded-3xl p-8 md:p-12 text-center mb-12">
          <MessageCircle className="h-14 w-14 mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-tight mb-3">
            WhatsApp
          </h2>
          <p className="text-white/85 mb-8 max-w-sm mx-auto">
            La forma mas rapida de contactarnos. Respuesta en minutos.
          </p>
          <LinkButton
            href="https://wa.me/5215551234567?text=Hola!%20Quiero%20informacion%20sobre%20Soccerville"
            target="_blank"
            size="lg"
            className="!bg-white !text-[#25D366] hover:!bg-white/90 font-bold rounded-full px-8 h-12 border-0 shadow-lg"
          >
            Abrir WhatsApp
          </LinkButton>
        </div>

        {/* Venues with real maps */}
        <div className="grid gap-8 md:grid-cols-2">
          {venueKeys.map((key) => {
            const venue = VENUES[key];
            return (
              <Card key={key} className="border-0 shadow-sm overflow-hidden">
                {/* Google Maps Embed */}
                <div className="aspect-video w-full">
                  <iframe
                    src={venue.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa Soccerville ${venue.name}`}
                    className="w-full h-full"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="font-display text-2xl uppercase tracking-tight flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {venue.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-sm">{venue.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{venue.hours}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <LinkButton
                      href={`https://wa.me/${venue.whatsapp}?text=${encodeURIComponent(`Hola! Quiero informacion sobre la sede ${venue.name}`)}`}
                      target="_blank"
                      className="flex-1 rounded-full !bg-[#25D366] !text-white hover:!bg-[#22c55e] border-0"
                    >
                      WhatsApp
                    </LinkButton>
                    <LinkButton
                      href={`tel:${venue.phone.replace(/\s/g, "")}`}
                      className="flex-1 rounded-full !bg-[#0a0a0a] !text-white hover:!bg-[#222] border-0"
                    >
                      Llamar
                    </LinkButton>
                  </div>

                  <Link
                    href={venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full border border-black/10 py-2 text-sm text-muted-foreground hover:bg-black hover:text-white transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Como llegar
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
