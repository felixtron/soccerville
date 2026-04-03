import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { SportsTicker } from "@/components/public/sports-ticker";
import { Clock, MapPin, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escuela de Futbol",
  description: "Escuela de futbol Red Diablos en Metepec y Sirenas FC en Calimaya.",
};

const programs = [
  {
    name: "Red Diablos",
    type: "Escuela de Futbol",
    venue: "Metepec",
    schedule: "Lunes a Jueves",
    time: "4:00 PM - 6:00 PM",
    description: "Formacion integral en futbol 7 para ninos y jovenes. Desarrollo de habilidades tecnicas, tacticas y valores deportivos.",
    whatsapp: "5215551234567",
    cta: "Inscribir a mi hijo",
  },
  {
    name: "Sirenas FC",
    type: "Equipo Fijo",
    venue: "Calimaya",
    schedule: "Martes y Jueves",
    time: "4:00 PM - 6:00 PM",
    description: "Equipo femenino con entrenamientos regulares. Preparacion para competencias y torneos.",
    whatsapp: "5215551234567",
    cta: "Mas informacion",
  },
];

export default function EscuelaPage() {
  return (
    <>
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Formacion</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.85]">
            Escuela de
            <br />
            Futbol
          </h1>
          <p className="mt-4 text-white/50 max-w-md">
            Formacion deportiva con entrenadores profesionales. Desarrolla tu talento.
          </p>

          {/* Sports news ticker */}
          <SportsTicker />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.name} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="bg-primary/5 p-4 flex items-center justify-between">
                <Badge variant="secondary">{program.type}</Badge>
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {program.venue}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="font-display text-3xl uppercase tracking-tight">
                  {program.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{program.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{program.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{program.time}</span>
                  </div>
                </div>
                <LinkButton
                  href={`https://wa.me/${program.whatsapp}?text=${encodeURIComponent(`Hola! Me interesa informacion sobre ${program.name}`)}`}
                  target="_blank"
                  className="w-full rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
                >
                  {program.cta}
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
