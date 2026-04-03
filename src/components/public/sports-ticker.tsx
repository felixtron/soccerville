"use client";

import { useState, useEffect, useCallback } from "react";

const headlines = [
  "Red Diablos invictos en temporada 2025",
  "Sirenas FC clasificadas al regional femenil",
  "Inscripciones abiertas — Escuela Red Diablos Lun-Jue 4-6PM",
  "Nuevas categorias Sub-10 y Sub-13 disponibles",
  "Entrenadores certificados con experiencia profesional",
  "Mas de 50 alumnos formados en la cantera Soccerville",
  "Sirenas FC busca nuevas jugadoras — Martes y Jueves",
];

export function SportsTicker() {
  const [current, setCurrent] = useState(0);
  const [animState, setAnimState] = useState<"in" | "out">("in");

  const advance = useCallback(() => {
    setAnimState("out");
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % headlines.length);
      setAnimState("in");
    }, 500);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 4000);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <div className="relative w-full mt-8 md:mt-10 select-none">
      {/* Main bar — dark with angular cuts */}
      <div className="relative flex items-stretch h-11 md:h-12">
        {/* Red left accent — "LIVE" tag */}
        <div className="relative flex items-center shrink-0">
          <div
            className="bg-red-600 text-white h-full flex items-center px-4 md:px-5 text-[11px] md:text-xs font-black uppercase tracking-widest"
            style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}
          >
            <span className="relative flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              EN VIVO
            </span>
          </div>
        </div>

        {/* Dark center bar — news content */}
        <div
          className="bg-[#1a1a1a] flex-1 flex items-center overflow-hidden px-4 md:px-6 -ml-1"
          style={{ clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)" }}
        >
          {/* Scrolling text with italic sport font */}
          <div className="flex-1 overflow-hidden">
            <p
              className={`font-display text-white text-sm md:text-base uppercase tracking-wide truncate transition-all duration-500 ${
                animState === "in"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
              style={{ fontStyle: "italic" }}
            >
              {headlines[current]}
            </p>
          </div>

          {/* "NOTICIAS" label */}
          <span className="hidden md:inline text-[10px] text-white/30 uppercase tracking-widest font-bold ml-4 shrink-0">
            Noticias
          </span>
        </div>

        {/* Red right accent — "CHANNEL" tag */}
        <div className="relative flex items-center shrink-0 -ml-1">
          <div
            className="bg-red-600 text-white h-full flex items-center px-4 md:px-5 text-[11px] md:text-xs font-black uppercase tracking-widest"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)" }}
          >
            SOCCERVILLE
          </div>
        </div>
      </div>

      {/* Bottom red stripe accent */}
      <div className="flex items-stretch h-1.5 mt-px">
        <div className="w-24 md:w-32" />
        <div
          className="bg-red-600 flex-1"
          style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
        />
        <div className="w-4 md:w-6" />
      </div>
    </div>
  );
}
