import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Store, Megaphone, PartyPopper, DollarSign, FileText, Users, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espacios Comerciales",
  description: "Renta espacios para foodtrucks, publicidad y eventos especiales en Soccerville.",
};

const spaces = [
  {
    icon: Store,
    title: "Foodtrucks",
    price: "$2,500/mes",
    contract: "Contrato minimo 6 meses",
    spots: "4 espacios disponibles",
    venue: "Metepec",
    description: "Ubicacion privilegiada con alto trafico de personas. Acceso a clientes de torneos, escuelas y eventos.",
    benefits: ["+1,000 personas semanales", "Estacionamiento para clientes", "Visibilidad en redes sociales"],
  },
  {
    icon: Megaphone,
    title: "Publicidad",
    price: "$1,500/mes",
    contract: "Contrato minimo 6 meses",
    spots: "Espacios disponibles",
    venue: "Metepec",
    description: "Espacios publicitarios dentro de las instalaciones. Alcance directo a jugadores, familias y aficionados.",
    benefits: ["Visibilidad en cancha", "Alcance semanal 1,000+ personas", "Posiciones estrategicas"],
  },
  {
    icon: PartyPopper,
    title: "Eventos",
    price: "Cotizacion",
    contract: "Reserva por evento",
    spots: "Ambas sedes",
    venue: "Metepec y Calimaya",
    description: "Renta la cancha para cualquier giro: bazares, calistenia, inflables, activaciones de marca y mas.",
    benefits: ["Espacio amplio y versatil", "Estacionamiento incluido", "Fechas flexibles"],
  },
];

export default function EspaciosPage() {
  return (
    <>
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Negocios</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.85]">
            Espacios
            <br />
            Comerciales
          </h1>
          <p className="mt-4 text-white/50 max-w-md">
            Haz crecer tu negocio en un espacio con alto trafico de personas.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.title} className="flex flex-col border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <space.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl uppercase tracking-tight">
                      {space.title}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {space.venue}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm mb-5">{space.description}</p>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{space.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {space.contract}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {space.spots}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Beneficios
                  </p>
                  <ul className="space-y-1.5">
                    {space.benefits.map((b) => (
                      <li key={b} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <LinkButton
                  href={`https://wa.me/5215551234567?text=${encodeURIComponent(`Hola! Me interesa un espacio de ${space.title} en Soccerville`)}`}
                  target="_blank"
                  className="w-full mt-auto rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
                >
                  Quiero un espacio
                </LinkButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
