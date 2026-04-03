import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { VenueShowcase } from "@/components/public/venue-showcase";
import { StatsBar } from "@/components/public/stats-bar";
import { InstagramFeed } from "@/components/public/instagram-feed";
import { GoogleReviews } from "@/components/public/google-reviews";
import { SoccerBall, SoccerBallFloat } from "@/components/public/soccer-ball";
import { HeroTitle } from "@/components/public/hero-title";
import {
  Trophy,
  Calendar,
  GraduationCap,
  Store,
  Car,
  Lightbulb,
  ShowerHead,
  Zap,
} from "lucide-react";

const highlights = [
  {
    icon: Trophy,
    title: "Torneos",
    description: "Multiples categorias y horarios en ambas sedes",
    href: "/torneos/metepec",
    cta: "Ver torneos",
  },
  {
    icon: Calendar,
    title: "Renta de Cancha",
    description: "$550/hora con todo incluido",
    href: "/reservar",
    cta: "Reservar ahora",
  },
  {
    icon: GraduationCap,
    title: "Escuela de Futbol",
    description: "Formacion deportiva para todas las edades",
    href: "/escuela",
    cta: "Mas informacion",
  },
  {
    icon: Store,
    title: "Espacios Comerciales",
    description: "Foodtrucks, publicidad y eventos especiales",
    href: "/espacios",
    cta: "Ver espacios",
  },
];

const amenities = [
  { icon: Car, label: "Estacionamiento" },
  { icon: ShowerHead, label: "Vestidores" },
  { icon: Lightbulb, label: "Alumbrado" },
  { icon: Zap, label: "Pasto sintetico" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero - Full viewport, massive typography */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }} />

        {/* Soccer ball with scroll animation */}
        <SoccerBall />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 md:py-0 z-20">
          {/* Logo */}
          <div className="flex justify-center mb-8 md:mb-12">
            <Image
              src="/images/soccerville-w.svg"
              alt="Soccerville"
              width={280}
              height={280}
              className="h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56 object-contain"
              priority
            />
          </div>

          {/* Giant headline with GSAP animation */}
          <HeroTitle />

          <div className="text-center">
            <p className="mt-6 md:mt-8 text-base md:text-lg text-white/60 max-w-md mx-auto font-sans">
              Torneos, renta de canchas, escuela de futbol y mas en Metepec y
              Calimaya
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 md:mt-10">
              <LinkButton
                href="/torneos/metepec"
                size="lg"
                className="!bg-emerald-500 !text-white hover:!bg-emerald-400 font-bold text-base px-8 h-12 rounded-full shadow-lg shadow-emerald-500/25 border-0"
              >
                Inscribirme a Torneo
              </LinkButton>
              <LinkButton
                href="/reservar"
                size="lg"
                className="!bg-transparent !text-white !border-2 !border-white/40 hover:!border-white hover:!bg-white/10 font-bold text-base px-8 h-12 rounded-full"
              >
                Reservar Cancha
              </LinkButton>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/30">
            <span className="text-xs uppercase tracking-[0.3em] font-sans">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <StatsBar />

      {/* Venue Showcase - CodePen inspired */}
      <VenueShowcase />

      {/* Services */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">
              Servicios
            </p>
            <h2 className="font-display text-4xl md:text-6xl uppercase tracking-tight">
              Todo lo que necesitas
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="group border-0 shadow-none bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <LinkButton
                    href={item.href}
                    variant="link"
                    className="mt-4 p-0 h-auto text-primary font-semibold"
                  >
                    {item.cta} &rarr;
                  </LinkButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rent - Full bleed dark */}
      <section className="relative bg-[#0a0a0a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        {/* Floating soccer ball */}
        <div className="absolute top-12 right-8 md:top-16 md:right-16">
          <SoccerBallFloat />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-3">
                Renta de Cancha
              </p>
              <h2 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight">
                $550
                <span className="text-2xl md:text-3xl text-white/40 align-top ml-1">
                  /HR
                </span>
              </h2>
              <p className="mt-4 text-white/60 text-lg max-w-md">
                Todo incluido, sin sorpresas. Llega y juega.
              </p>
              <LinkButton
                href="/reservar"
                size="lg"
                className="mt-8 !bg-emerald-500 !text-white hover:!bg-emerald-400 font-bold px-8 h-12 rounded-full shadow-lg shadow-emerald-500/25 border-0"
              >
                Reservar Cancha
              </LinkButton>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-3 text-center bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviews />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA Torneo Privado - Bold */}
      <section className="relative bg-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-24 text-center">
          <h2 className="font-display text-4xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.9]">
            Quieres tu
            <br />
            torneo privado?
          </h2>
          <p className="mt-6 text-white/80 text-lg max-w-xl mx-auto font-sans">
            Empresas, amigos, escuelas — organiza tu propio torneo en nuestras
            instalaciones. Nosotros nos encargamos de todo.
          </p>
          <LinkButton
            href="/contacto"
            size="lg"
            className="mt-8 !bg-white !text-red-600 hover:!bg-white/90 font-bold px-8 h-12 rounded-full shadow-lg border-0"
          >
            Cotizar Evento
          </LinkButton>
        </div>
      </section>
    </>
  );
}
