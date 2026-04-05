"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Users,
  DollarSign,
  Gavel,
  Zap,
  Trophy,
  ChevronRight,
  Search,
  X,
  Calendar,
} from "lucide-react";
import { EditTournamentButton } from "@/components/admin/tournament-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTournament } from "@/app/admin/actions";

type TournamentData = {
  id: string;
  name: string;
  slug: string;
  venueId: string;
  venueName: string;
  category: string;
  schedule: string;
  maxTeams: number;
  inscriptionFee: number;
  refereeFee: number;
  refereeFeePerMatch: boolean;
  status: string;
  teamCount: number;
  matchCount: number;
  startDate: string | null;
};

type Venue = { id: string; name: string };

function getNextStep(t: TournamentData) {
  if (t.status === "OPEN" && t.teamCount < t.maxTeams) {
    return { label: "Inscribir equipos", hint: `${t.maxTeams - t.teamCount} lugares`, class: "text-emerald-600 bg-emerald-50" };
  }
  if ((t.status === "OPEN" || t.status === "FULL") && t.matchCount === 0) {
    return { label: "Generar fixtures", hint: `${t.teamCount} equipos listos`, class: "text-amber-600 bg-amber-50" };
  }
  if (t.status === "IN_PROGRESS") {
    return { label: "Registrar resultados", hint: `${t.matchCount} partidos`, class: "text-blue-600 bg-blue-50" };
  }
  return null;
}

export function TournamentFilters({
  tournaments,
  venues,
  statusMap,
}: {
  tournaments: TournamentData[];
  venues: Venue[];
  statusMap: Record<string, { label: string; class: string }>;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  const filtered = useMemo(() => {
    let result = tournaments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (venueFilter) {
      result = result.filter((t) => t.venueId === venueFilter);
    }
    return result;
  }, [tournaments, search, statusFilter, venueFilter]);

  const hasFilters = search || statusFilter || venueFilter;

  // Group by status for display
  const sections = [
    { key: "IN_PROGRESS", label: "En Curso", items: filtered.filter((t) => t.status === "IN_PROGRESS") },
    { key: "FULL", label: "Llenos — Listos para Fixtures", items: filtered.filter((t) => t.status === "FULL") },
    { key: "OPEN", label: "Inscripciones Abiertas", items: filtered.filter((t) => t.status === "OPEN") },
    { key: "FINISHED", label: "Finalizados", items: filtered.filter((t) => t.status === "FINISHED") },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar torneo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="FULL">Lleno</option>
          <option value="IN_PROGRESS">En curso</option>
          <option value="FINISHED">Finalizado</option>
        </select>
        <select
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas las sedes</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name.replace("Soccerville ", "")}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); setVenueFilter(""); }}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {tournaments.length} torneos
        {hasFilters && " (filtrado)"}
      </p>

      {/* Sections by status */}
      {sections.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay torneos que mostrar.</p>
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => (
          <div key={section.key}>
            <h2 className="font-display text-lg uppercase tracking-tight mb-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  section.key === "IN_PROGRESS" ? "bg-blue-500" :
                  section.key === "FULL" ? "bg-amber-500" :
                  section.key === "OPEN" ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {section.label}
              <span className="text-sm font-normal text-muted-foreground">({section.items.length})</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((t) => {
                const status = statusMap[t.status] ?? statusMap.OPEN;
                const next = getNextStep(t);
                return (
                  <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-display text-lg uppercase tracking-tight">
                          <Link href={`/admin/torneos/${t.id}`} className="hover:text-primary transition-colors">
                            {t.name}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={status.class}>{status.label}</Badge>
                          <EditTournamentButton
                            venues={venues}
                            tournament={t}
                          />
                          <DeleteButton label="torneo" onDelete={deleteTournament.bind(null, t.id)} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t.venueName}
                        <span>&middot;</span>
                        <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{t.schedule}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-[#fafafa] rounded-lg p-2">
                          <p className="font-bold text-sm">{t.teamCount}/{t.maxTeams}</p>
                          <p className="text-[10px] text-muted-foreground">Equipos</p>
                        </div>
                        <div className="bg-[#fafafa] rounded-lg p-2">
                          <p className="font-bold text-sm">${t.inscriptionFee.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Inscripcion</p>
                        </div>
                        <div className="bg-[#fafafa] rounded-lg p-2">
                          <p className="font-bold text-sm">${t.refereeFee.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Arbitraje{t.refereeFeePerMatch ? "/p" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Next step CTA */}
                      {next && (
                        <Link
                          href={`/admin/torneos/${t.id}`}
                          className={`flex items-center justify-between p-2.5 rounded-lg ${next.class} transition-colors hover:opacity-80`}
                        >
                          <div>
                            <p className="text-xs font-bold">{next.label}</p>
                            <p className="text-[10px] opacity-70">{next.hint}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </Link>
                      )}

                      {t.status === "FINISHED" && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 text-gray-500 text-xs">
                          <Trophy className="h-3.5 w-3.5" />
                          {t.matchCount} partidos jugados
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
