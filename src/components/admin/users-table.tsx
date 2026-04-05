"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  Search,
  Trophy,
  Users,
  X,
  UserCog,
} from "lucide-react";
import { EditUserButton, ResetPasswordButton } from "@/components/admin/user-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteUser } from "@/app/admin/actions";

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  venueId: string | null;
  venueName: string | null;
  teamId: string | null;
  teamName: string | null;
  tournamentIds: string[];
  tournamentNames: string[];
  createdAt: string;
};

type Venue = { id: string; name: string };
type Tournament = { id: string; name: string };

const roleLabels: Record<string, { label: string; class: string; icon: string }> = {
  ADMIN: { label: "Admin", class: "bg-red-100 text-red-700", icon: "A" },
  OPERATOR: { label: "Operador", class: "bg-blue-100 text-blue-700", icon: "O" },
  CAPTAIN: { label: "Capitan", class: "bg-emerald-100 text-emerald-700", icon: "C" },
};

export function UsersTable({
  users,
  venues,
  tournaments,
}: {
  users: UserData[];
  venues: Venue[];
  tournaments: Tournament[];
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("");

  const filtered = useMemo(() => {
    let result = users;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.teamName?.toLowerCase().includes(q)
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (venueFilter) {
      result = result.filter((u) => u.venueId === venueFilter);
    }

    if (tournamentFilter) {
      result = result.filter((u) => u.tournamentIds.includes(tournamentFilter));
    }

    return result;
  }, [users, search, roleFilter, venueFilter, tournamentFilter]);

  const hasFilters = search || roleFilter || venueFilter || tournamentFilter;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="OPERATOR">Operador</option>
          <option value="CAPTAIN">Capitan</option>
        </select>

        {/* Venue filter */}
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

        {/* Tournament filter */}
        <select
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los torneos</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setVenueFilter("");
              setTournamentFilter("");
            }}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {users.length} usuarios
        {hasFilters && " (filtrado)"}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <UserCog className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {hasFilters
                ? "No se encontraron usuarios con esos filtros."
                : "No hay usuarios registrados."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const role = roleLabels[user.role] ?? roleLabels.CAPTAIN;
            return (
              <Card key={user.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${role.class}`}
                    >
                      {role.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Name + role */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{user.name}</p>
                        <Badge className={role.class + " text-[10px]"}>
                          {role.label}
                        </Badge>
                      </div>
                      {/* Contact info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            {user.phone}
                          </span>
                        )}
                        {user.venueName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {user.venueName}
                          </span>
                        )}
                      </div>
                      {/* Team + tournaments */}
                      {user.teamName && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Users className="h-2.5 w-2.5" />
                            {user.teamName}
                          </Badge>
                          {user.tournamentNames.map((tn, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] gap-1"
                            >
                              <Trophy className="h-2.5 w-2.5" />
                              {tn}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mr-1">
                      {new Date(user.createdAt).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <EditUserButton
                      venues={venues}
                      user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        venueId: user.venueId,
                      }}
                    />
                    <ResetPasswordButton userId={user.id} userName={user.name} />
                    <DeleteButton
                      label="usuario"
                      onDelete={deleteUser.bind(null, user.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
