"use client";

import { useMemo } from "react";

type Match = {
  id: string;
  matchDay: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

const statusColors: Record<string, string> = {
  PLAYED: "bg-emerald-500",
  DEFAULTED: "bg-orange-500",
  ABANDONED: "bg-purple-500",
  CANCELLED: "bg-red-400",
  SCHEDULED: "bg-gray-200",
};

export function MatchMap({
  matches,
  totalDays,
}: {
  matches: Match[];
  totalDays: number;
}) {
  const byDay = useMemo(() => {
    const map = new Map<number, Match[]>();
    for (const m of matches) {
      if (!map.has(m.matchDay)) map.set(m.matchDay, []);
      map.get(m.matchDay)!.push(m);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [matches]);

  const played = matches.filter(
    (m) => m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED"
  ).length;
  const pct = matches.length > 0 ? Math.round((played / matches.length) * 100) : 0;

  return (
    <div className="p-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
          {played}/{matches.length} ({pct}%)
        </span>
      </div>

      {/* Grid map */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {byDay.map(([day, dayMatches]) => (
            <div key={day} className="flex items-center gap-2 mb-1.5">
              {/* Day label */}
              <div className="w-10 shrink-0 text-right">
                <span className="text-[10px] font-bold text-muted-foreground">J{day}</span>
              </div>
              {/* Match cells */}
              <div className="flex gap-1 flex-1 flex-wrap">
                {dayMatches.map((m) => {
                  const isPlayed = m.status === "PLAYED" || m.status === "DEFAULTED" || m.status === "ABANDONED";
                  const color = statusColors[m.status] ?? statusColors.SCHEDULED;
                  return (
                    <div
                      key={m.id}
                      className={`group relative rounded-md px-2 py-1.5 text-[10px] cursor-default transition-all hover:scale-105 hover:shadow-md ${
                        isPlayed
                          ? `${color} text-white`
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                      style={{ minWidth: 120 }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate max-w-[40px]">
                          {m.homeTeam.slice(0, 5)}
                        </span>
                        {isPlayed ? (
                          <span className="font-bold">
                            {m.homeScore}-{m.awayScore}
                          </span>
                        ) : (
                          <span className="text-[9px] opacity-60">vs</span>
                        )}
                        <span className="font-medium truncate max-w-[40px]">
                          {m.awayTeam.slice(0, 5)}
                        </span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1.5 bg-[#0a0a0a] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <p className="font-medium">{m.homeTeam} vs {m.awayTeam}</p>
                        {isPlayed && (
                          <p className="text-white/70">
                            Resultado: {m.homeScore} - {m.awayScore}
                          </p>
                        )}
                        <p className="text-white/50">Jornada {m.matchDay}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
        {[
          { color: "bg-emerald-500", label: "Jugado" },
          { color: "bg-orange-500", label: "Default" },
          { color: "bg-red-400", label: "Cancelado" },
          { color: "bg-gray-200", label: "Pendiente" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
