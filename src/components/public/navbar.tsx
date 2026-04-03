"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const links = [
  { href: "/torneos/metepec", label: "Torneos" },
  { href: "/reservar", label: "Reservar" },
  { href: "/escuela", label: "Escuela" },
  { href: "/espacios", label: "Espacios" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-black/5">
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/svm.png"
            alt="Soccerville"
            width={44}
            height={44}
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-xl uppercase tracking-tight text-foreground hidden sm:inline">
            Soccerville
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-full p-2 text-foreground/50 transition-colors hover:bg-black/5 hover:text-foreground"
            title="Acceso Capitanes"
          >
            <User className="h-4.5 w-4.5" />
          </Link>
          <LinkButton
            href="/torneos/metepec"
            size="sm"
            className="ml-1 rounded-full px-5 !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
          >
            Inscribirme
          </LinkButton>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-foreground/70 hover:bg-black/5 transition-colors">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
            <div className="flex flex-col gap-2 pt-8">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 pb-6 border-b mb-2"
              >
                <Image
                  src="/images/svm.png"
                  alt="Soccerville"
                  width={40}
                  height={40}
                  className="h-8 w-8 object-contain"
                />
                <span className="font-display text-lg uppercase tracking-tight">
                  Soccerville
                </span>
              </Link>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Mi Equipo
              </Link>
              <LinkButton
                href="/torneos/metepec"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-full !bg-emerald-600 !text-white hover:!bg-emerald-500 border-0"
              >
                Inscribirme a Torneo
              </LinkButton>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
