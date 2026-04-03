"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const venues = [
  { name: "Metepec", slug: "metepec", tagline: "10+ Torneos activos" },
  { name: "Calimaya", slug: "calimaya", tagline: "Nuevos torneos" },
];

export function VenueShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const viewH = window.innerHeight;
          const progress = Math.max(
            0,
            Math.min(1, 1 - (rect.top + rect.height) / (viewH + rect.height))
          );
          const speed = (progress - 0.5) * 2;
          containerRef.current.style.setProperty(
            "--speed",
            speed.toFixed(3)
          );
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white dot-overlay">
      <div
        ref={containerRef}
        className="skew-scroll mx-auto max-w-7xl px-4 py-24 md:py-32 flex flex-col items-center gap-4 md:gap-6"
      >
        <p className="font-sans text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 relative z-10">
          Nuestras sedes
        </p>
        {venues.map((venue) => (
          <Link
            key={venue.slug}
            href={`/torneos/${venue.slug}`}
            className="group block relative z-10"
          >
            <h2
              className="venue-item venue-item-pattern"
              data-text={venue.name}
            >
              {venue.name}
            </h2>
            <span className="block font-sans text-sm text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity -mt-2">
              {venue.tagline} &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
