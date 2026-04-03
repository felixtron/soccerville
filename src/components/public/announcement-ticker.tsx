"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Timer, TrendingUp, Star, Zap, CalendarDays, Users, Target, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type TickerItem = {
  icon: ReactNode;
  text: string;
};

const items: TickerItem[] = [
  { icon: <Trophy className="h-3.5 w-3.5" />, text: "Proximamente: Torneos en vivo" },
  { icon: <Target className="h-3.5 w-3.5" />, text: "Marcadores en tiempo real" },
  { icon: <CalendarDays className="h-3.5 w-3.5" />, text: "Reservas online 24/7" },
  { icon: <TrendingUp className="h-3.5 w-3.5" />, text: "Tabla de posiciones automatica" },
  { icon: <Zap className="h-3.5 w-3.5" />, text: "Pagos con tarjeta, SPEI y OXXO" },
  { icon: <Users className="h-3.5 w-3.5" />, text: "Gestion de equipos y jugadores" },
  { icon: <Star className="h-3.5 w-3.5" />, text: "Nuevo: Torneo Femenil Metepec" },
  { icon: <Timer className="h-3.5 w-3.5" />, text: "Nuevo: Torneo Veteranos" },
  { icon: <Trophy className="h-3.5 w-3.5" />, text: "Sabatino Calimaya — Inscripciones abiertas" },
  { icon: <Star className="h-3.5 w-3.5" />, text: "Femenil Sabatino Calimaya — Pre-registro" },
];

export function AnnouncementTicker() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
      setIsAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [next]);

  const item = items[current];
  const nextItem = items[(current + 1) % items.length];

  return (
    <div className="bg-amber-400 text-black overflow-hidden relative">
      <div className="mx-auto max-w-7xl flex items-center justify-center h-9 px-4">
        {/* Decorative dots left */}
        <div className="hidden sm:flex items-center gap-1 mr-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i === current % 3 ? "bg-black" : "bg-black/20"
              }`}
            />
          ))}
        </div>

        {/* Carousel */}
        <div className="relative h-full flex items-center overflow-hidden min-w-0">
          <div
            className={`flex items-center gap-2 text-xs font-bold tracking-wide uppercase transition-all duration-400 ${
              isAnimating
                ? "opacity-0 -translate-y-full"
                : "opacity-100 translate-y-0"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.text}</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrent(i);
                  setIsAnimating(false);
                }, 400);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-4 bg-black"
                  : "w-1 bg-black/25 hover:bg-black/40"
              }`}
              aria-label={`Anuncio ${i + 1}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          className="ml-3 h-5 w-5 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors shrink-0"
          aria-label="Siguiente anuncio"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
