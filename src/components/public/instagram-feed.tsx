"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/icons";

const accounts = [
  {
    handle: "@soccervillemetepec",
    url: "https://www.instagram.com/soccervillemetepec/",
    label: "Metepec",
  },
  {
    handle: "@soccervillecalimaya",
    url: "https://www.instagram.com/soccervillecalimaya/",
    label: "Calimaya",
  },
];

// Placeholder posts — these will be replaced with real Instagram embeds or API data later
const posts = [
  { id: 1, color: "from-green-600 to-emerald-800", label: "Torneo Nocturno", type: "Metepec" },
  { id: 2, color: "from-red-600 to-red-800", label: "Gol de la jornada", type: "Metepec" },
  { id: 3, color: "from-amber-500 to-orange-700", label: "Sabatino lleno!", type: "Metepec" },
  { id: 4, color: "from-blue-600 to-indigo-800", label: "Nuevos torneos", type: "Calimaya" },
  { id: 5, color: "from-purple-600 to-purple-900", label: "Femenil arranca", type: "Calimaya" },
  { id: 6, color: "from-emerald-600 to-teal-800", label: "Red Diablos", type: "Metepec" },
];

export function InstagramFeed() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="bg-[#fafafa] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                <InstagramIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                Instagram
              </p>
            </div>
            <h2 className="font-display text-4xl md:text-6xl uppercase tracking-tight">
              Siguenos
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {accounts.map((account) => (
              <Link
                key={account.handle}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-black hover:text-white transition-colors group"
              >
                <InstagramIcon className="h-4 w-4" />
                {account.handle}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={
                post.type === "Metepec"
                  ? "https://www.instagram.com/soccervillemetepec/"
                  : "https://www.instagram.com/soccervillecalimaya/"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden"
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Gradient placeholder — replace with real images */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.color} transition-transform duration-500 group-hover:scale-110`}
              />

              {/* Dot pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6' viewBox='0 0 6 6'%3E%3Ccircle cx='3' cy='3' r='1' fill='white' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs uppercase tracking-wider mb-1">
                  {post.type}
                </span>
                <span className="text-white font-display text-lg md:text-xl uppercase tracking-tight">
                  {post.label}
                </span>
              </div>

              {/* Instagram icon on hover */}
              <div
                className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                  hoveredId === post.id
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75"
                }`}
              >
                <InstagramIcon className="h-4 w-4 text-white" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Fotos reales de torneos, goles y comunidad.{" "}
            <Link
              href="https://www.instagram.com/soccervillemetepec/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
            >
              Ver mas en Instagram
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
