"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { sendNotification } from "@/app/admin/actions";

type Props = {
  venues: { id: string; name: string }[];
  tournaments: { id: string; name: string }[];
  teams: { id: string; name: string }[];
};

export function NotificationForm({ venues, tournaments, teams }: Props) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState("ALL");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-500" />}>
        <Bell className="h-4 w-4 mr-2" />
        Nueva Notificacion
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Notificacion</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await sendNotification(formData);
              setOpen(false);
            });
          }}
          className="space-y-4 py-2"
        >
          <div>
            <Label htmlFor="title" className="text-xs uppercase tracking-wider">
              Titulo
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ej: Cambio de horario"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="body" className="text-xs uppercase tracking-wider">
              Mensaje
            </Label>
            <textarea
              id="body"
              name="body"
              required
              rows={3}
              placeholder="Escribe el mensaje..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider">Destinatarios</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[
                { value: "ALL", label: "Todos" },
                { value: "VENUE", label: "Por sede" },
                { value: "TOURNAMENT", label: "Por torneo" },
                { value: "TEAM", label: "Equipo especifico" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAudience(opt.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    audience === opt.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-input hover:border-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="audience" value={audience} />
          </div>

          {audience === "VENUE" && (
            <div>
              <Label htmlFor="venueId" className="text-xs uppercase tracking-wider">
                Sede
              </Label>
              <select
                id="venueId"
                name="venueId"
                required
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Seleccionar sede...</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === "TOURNAMENT" && (
            <div>
              <Label htmlFor="tournamentId" className="text-xs uppercase tracking-wider">
                Torneo
              </Label>
              <select
                id="tournamentId"
                name="tournamentId"
                required
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Seleccionar torneo...</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === "TEAM" && (
            <div>
              <Label htmlFor="teamId" className="text-xs uppercase tracking-wider">
                Equipo
              </Label>
              <select
                id="teamId"
                name="teamId"
                required
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Seleccionar equipo...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {pending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
