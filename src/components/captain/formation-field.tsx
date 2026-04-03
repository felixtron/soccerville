"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TeamLogo } from "@/components/shared/team-logo";

// ─── Futbol 7 Formations ──────────────────────────────────

type FormationId = "1-2-3-1" | "1-3-2-1" | "1-2-2-2" | "1-3-1-2" | "1-2-1-2-1";

type FormationDef = {
  id: FormationId;
  label: string;
  description: string;
  /** Positions as [x%, y%] from top-left of the half-field. Y=0 is goal, Y=100 is midfield */
  slots: { x: number; y: number; role: string }[];
};

const FORMATIONS: FormationDef[] = [
  {
    id: "1-2-3-1",
    label: "1-2-3-1",
    description: "Equilibrada. Ideal para equipos que controlan el medio campo.",
    slots: [
      { x: 50, y: 92, role: "POR" },
      { x: 30, y: 72, role: "DEF" },
      { x: 70, y: 72, role: "DEF" },
      { x: 20, y: 45, role: "MED" },
      { x: 50, y: 40, role: "MED" },
      { x: 80, y: 45, role: "MED" },
      { x: 50, y: 15, role: "DEL" },
    ],
  },
  {
    id: "1-3-2-1",
    label: "1-3-2-1",
    description: "Defensiva. Tres defensas dan solidez atras.",
    slots: [
      { x: 50, y: 92, role: "POR" },
      { x: 20, y: 72, role: "DEF" },
      { x: 50, y: 75, role: "DEF" },
      { x: 80, y: 72, role: "DEF" },
      { x: 35, y: 45, role: "MED" },
      { x: 65, y: 45, role: "MED" },
      { x: 50, y: 15, role: "DEL" },
    ],
  },
  {
    id: "1-2-2-2",
    label: "1-2-2-2",
    description: "Ofensiva. Dos delanteros para presion constante.",
    slots: [
      { x: 50, y: 92, role: "POR" },
      { x: 30, y: 72, role: "DEF" },
      { x: 70, y: 72, role: "DEF" },
      { x: 35, y: 45, role: "MED" },
      { x: 65, y: 45, role: "MED" },
      { x: 35, y: 15, role: "DEL" },
      { x: 65, y: 15, role: "DEL" },
    ],
  },
  {
    id: "1-3-1-2",
    label: "1-3-1-2",
    description: "Contraataque. Defensa solida con dos puntas rapidas.",
    slots: [
      { x: 50, y: 92, role: "POR" },
      { x: 20, y: 72, role: "DEF" },
      { x: 50, y: 75, role: "DEF" },
      { x: 80, y: 72, role: "DEF" },
      { x: 50, y: 45, role: "MED" },
      { x: 35, y: 15, role: "DEL" },
      { x: 65, y: 15, role: "DEL" },
    ],
  },
  {
    id: "1-2-1-2-1",
    label: "1-2-1-2-1",
    description: "Diamante. Medio creativo con apoyo por bandas.",
    slots: [
      { x: 50, y: 92, role: "POR" },
      { x: 30, y: 72, role: "DEF" },
      { x: 70, y: 72, role: "DEF" },
      { x: 50, y: 52, role: "MED" },
      { x: 25, y: 32, role: "MED" },
      { x: 75, y: 32, role: "MED" },
      { x: 50, y: 12, role: "DEL" },
    ],
  },
];

const ROLE_COLORS: Record<string, string> = {
  POR: "bg-amber-500",
  DEF: "bg-blue-500",
  MED: "bg-emerald-500",
  DEL: "bg-red-500",
};

const POSITION_TO_ROLE: Record<string, string> = {
  Portero: "POR",
  Defensa: "DEF",
  Medio: "MED",
  Delantero: "DEL",
};

// ─── Types ─────────────────────────────────────────────────

type Player = {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
};

// ─── Component ─────────────────────────────────────────────

export function FormationField({
  players,
  teamName,
  logoUrl,
}: {
  players: Player[];
  teamName: string;
  logoUrl: string | null;
}) {
  const [formation, setFormation] = useState<FormationId>("1-2-3-1");
  const fieldRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<(HTMLDivElement | null)[]>([]);

  const currentFormation = FORMATIONS.find((f) => f.id === formation)!;

  // Assign players to slots by matching position/role
  const assignments = assignPlayersToSlots(players, currentFormation);

  // GSAP animation on formation change
  useEffect(() => {
    if (!fieldRef.current) return;

    const nodes = playersRef.current.filter(Boolean) as HTMLDivElement[];

    gsap.fromTo(
      nodes,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "back.out(1.7)",
      }
    );
  }, [formation]);

  // Initial entrance animation
  useEffect(() => {
    if (!fieldRef.current) return;

    // Animate the field lines
    const lines = fieldRef.current.querySelectorAll("[data-field-line]");
    gsap.fromTo(
      lines,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 }
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Formation selector */}
      <div className="flex flex-wrap gap-2">
        {FORMATIONS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormation(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              formation === f.id
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {currentFormation.description}
      </p>

      {/* Half field */}
      <div
        ref={fieldRef}
        className="relative w-full bg-emerald-700 rounded-2xl overflow-hidden"
        style={{ aspectRatio: "3 / 4" }}
      >
        {/* Grass pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-[12.5%] ${i % 2 === 0 ? "bg-white" : "bg-transparent"}`}
            />
          ))}
        </div>

        {/* Field markings */}
        {/* Sidelines */}
        <div
          data-field-line
          className="absolute inset-2 border-2 border-white/30 rounded-xl"
        />

        {/* Center line */}
        <div
          data-field-line
          className="absolute top-0 left-2 right-2 h-[2px] bg-white/30"
          style={{ top: "8px" }}
        />

        {/* Goal area */}
        <div
          data-field-line
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[55%] h-[18%] border-2 border-white/30 border-b-0 rounded-t-xl"
        />

        {/* Small box */}
        <div
          data-field-line
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-2 border-white/30 border-b-0 rounded-t-lg"
        />

        {/* Center circle (half) */}
        <div
          data-field-line
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] border-2 border-white/30 border-t-0 rounded-b-full"
          style={{ aspectRatio: "1", top: "-17.5%" }}
        />

        {/* Penalty spot */}
        <div
          data-field-line
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full"
          style={{ bottom: "22%" }}
        />

        {/* Team logo watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
          <TeamLogo logoUrl={logoUrl} teamName={teamName} size="xl" />
        </div>

        {/* Players */}
        {assignments.map((a, i) => (
          <div
            key={`${formation}-${i}`}
            ref={(el) => { playersRef.current[i] = el; }}
            className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${a.slot.x}%`, top: `${a.slot.y}%` }}
          >
            {/* Player dot */}
            <div
              className={`w-9 h-9 md:w-11 md:h-11 rounded-full ${
                ROLE_COLORS[a.slot.role]
              } flex items-center justify-center shadow-lg ring-2 ring-white/50 text-white font-bold text-xs md:text-sm`}
            >
              {a.player ? (a.player.number ?? "?") : "?"}
            </div>
            {/* Name tag */}
            <div className="bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 max-w-[80px]">
              <span className="text-[9px] md:text-[10px] text-white font-medium truncate block text-center leading-tight">
                {a.player ? a.player.name.split(" ").pop() : a.slot.role}
              </span>
            </div>
          </div>
        ))}

        {/* Role legend */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <div key={role} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[8px] text-white/50 font-medium">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Player assignment logic ───────────────────────────────

function assignPlayersToSlots(
  players: Player[],
  formation: FormationDef
): { slot: FormationDef["slots"][0]; player: Player | null }[] {
  const available = [...players];
  const result: { slot: FormationDef["slots"][0]; player: Player | null }[] = [];

  for (const slot of formation.slots) {
    // Try to find a player matching this role
    const matchIdx = available.findIndex((p) => {
      const playerRole = p.position ? POSITION_TO_ROLE[p.position] : null;
      return playerRole === slot.role;
    });

    if (matchIdx !== -1) {
      result.push({ slot, player: available.splice(matchIdx, 1)[0] });
    } else {
      // No matching player — try to fill with any remaining
      const fallback = available.shift() ?? null;
      result.push({ slot, player: fallback });
    }
  }

  return result;
}
