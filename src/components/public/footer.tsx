import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons";
import { VENUES } from "@/lib/venues";

const socials = [
  {
    icon: InstagramIcon,
    label: "Instagram Metepec",
    href: "https://www.instagram.com/soccervillemetepec/",
    handle: "@soccervillemetepec",
  },
  {
    icon: InstagramIcon,
    label: "Instagram Calimaya",
    href: "https://www.instagram.com/soccervillecalimaya/",
    handle: "@soccervillecalimaya",
  },
  {
    icon: FacebookIcon,
    label: "Facebook Calimaya",
    href: "https://www.facebook.com/SoccervilleCalimaya",
    handle: "Soccerville Calimaya",
  },
];

const venueKeys = ["metepec", "calimaya"] as const;

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* Big brand */}
        <div className="mb-12 md:mb-16">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/soccerville-w.svg"
              alt="Soccerville"
              width={56}
              height={56}
              className="h-12 w-12 object-contain"
            />
            <span className="font-display text-3xl md:text-4xl uppercase tracking-tight">
              Soccerville
            </span>
          </Link>
          <p className="mt-3 text-white/40 max-w-md text-sm">
            La mejor experiencia de futbol 7 en Metepec y Calimaya. Torneos,
            renta de canchas, escuela de futbol y espacios comerciales.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Links */}
          <div>
            <h3 className="font-display text-lg uppercase tracking-wider mb-4 text-white/60">
              Navegacion
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/torneos/metepec", label: "Torneos Metepec" },
                { href: "/torneos/calimaya", label: "Torneos Calimaya" },
                { href: "/reservar", label: "Reservar Cancha" },
                { href: "/escuela", label: "Escuela de Futbol" },
                { href: "/espacios", label: "Espacios Comerciales" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Venues with map links */}
          {venueKeys.map((key) => {
            const venue = VENUES[key];
            return (
              <div key={key}>
                <h3 className="font-display text-lg uppercase tracking-wider mb-4 text-white/60">
                  {venue.name}
                </h3>
                <ul className="space-y-2.5 text-sm text-white/50">
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/30" />
                    {venue.address}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-white/30" />
                    {venue.phone}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-white/30" />
                    {venue.hours}
                  </li>
                </ul>
                <Link
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/40 hover:text-white transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  Como llegar
                </Link>
              </div>
            );
          })}

          {/* Social */}
          <div>
            <h3 className="font-display text-lg uppercase tracking-wider mb-4 text-white/60">
              Redes sociales
            </h3>
            <ul className="space-y-3">
              {socials.map((social) => (
                <li key={social.href}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
                      <social.icon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{social.handle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-display text-lg uppercase tracking-wider mb-4 text-white/60">
              Contacto
            </h3>
            <p className="text-sm text-white/50 mb-4">
              La forma mas rapida de contactarnos es por WhatsApp.
            </p>
            <Link
              href="https://wa.me/5215551234567"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#22c55e] transition-colors"
            >
              Escribir por WhatsApp
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Soccerville. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4 text-white/60" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
