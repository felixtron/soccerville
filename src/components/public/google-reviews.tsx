"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, MapPin, ExternalLink } from "lucide-react";
import { VENUES } from "@/lib/venues";

type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
  venue: "metepec" | "calimaya";
};

// These are placeholder reviews — replace with Google Places API data in Phase 2
const reviews: Review[] = [
  {
    author: "Carlos M.",
    rating: 5,
    text: "Excelente cancha, muy bien mantenida. El pasto sintetico es de lo mejor que he jugado. Torneos bien organizados.",
    date: "Hace 2 semanas",
    venue: "metepec",
  },
  {
    author: "Ana R.",
    rating: 5,
    text: "Mi hijo va a la escuela Red Diablos y ha mejorado muchisimo. Los entrenadores son muy profesionales y dedicados.",
    date: "Hace 1 mes",
    venue: "metepec",
  },
  {
    author: "Jorge L.",
    rating: 5,
    text: "Buen lugar para jugar con los amigos. Tiene estacionamiento amplio, vestidores limpios y el alumbrado nocturno esta perfecto.",
    date: "Hace 3 semanas",
    venue: "metepec",
  },
  {
    author: "Miguel A.",
    rating: 4,
    text: "Buenas instalaciones en Calimaya. Los torneos son competitivos y bien arbitrados. Recomendado.",
    date: "Hace 1 semana",
    venue: "calimaya",
  },
  {
    author: "Laura P.",
    rating: 5,
    text: "El torneo femenil es una gran iniciativa. Las instalaciones estan muy bien y el ambiente es increible.",
    date: "Hace 2 semanas",
    venue: "calimaya",
  },
  {
    author: "Roberto S.",
    rating: 5,
    text: "Llevamos 3 torneos seguidos y cada vez mejor. La organizacion es de primer nivel. Precio justo por la calidad.",
    date: "Hace 1 mes",
    venue: "metepec",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                Google Reviews
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl uppercase tracking-tight">
              Lo que dicen
              <br />
              nuestros jugadores
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="h-10 w-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable reviews */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[85vw] sm:w-[380px] bg-[#fafafa] rounded-2xl p-6 md:p-8 flex flex-col"
            >
              <Stars rating={review.rating} />
              <p className="mt-4 text-foreground leading-relaxed flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {review.venue === "metepec" ? "Metepec" : "Calimaya"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Maps links */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {(["metepec", "calimaya"] as const).map((key) => {
            const venue = VENUES[key];
            return (
              <Link
                key={key}
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-black hover:text-white transition-colors group"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Ver resenas en {venue.name}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
