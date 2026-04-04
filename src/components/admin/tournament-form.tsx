"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
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
import { createTournament, updateTournament } from "@/app/admin/actions";

type Venue = { id: string; name: string };

type TournamentData = {
  id: string;
  name: string;
  venueId: string;
  category: string;
  schedule: string;
  maxTeams: number;
  inscriptionFee: number;
  refereeFee: number;
  refereeFeePerMatch: boolean;
  status: string;
  startDate: string | null;
};

export function CreateTournamentButton({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Torneo
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Torneo</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createTournament(formData);
              setOpen(false);
            });
          }}
        >
          <TournamentFields venues={venues} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTournamentButton({
  venues,
  tournament,
}: {
  venues: Venue[];
  tournament: TournamentData;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = updateTournament.bind(null, tournament.id);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Torneo</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await action(formData);
                setOpen(false);
              });
            }}
          >
            <TournamentFields venues={venues} defaults={tournament} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TournamentFields({
  venues,
  defaults,
}: {
  venues: Venue[];
  defaults?: Partial<TournamentData>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={defaults?.name} placeholder="Liga Nocturna Varonil" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="venueId">Sede</Label>
          <select
            id="venueId"
            name="venueId"
            required
            defaultValue={defaults?.venueId}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name.replace("Soccerville ", "")}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "OPEN"}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="OPEN">Abierto</option>
            <option value="FULL">Lleno</option>
            <option value="IN_PROGRESS">En curso</option>
            <option value="FINISHED">Finalizado</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            name="category"
            defaultValue={defaults?.category ?? "VARONIL"}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="VARONIL">Varonil</option>
            <option value="FEMENIL">Femenil</option>
            <option value="VETERANOS">Veteranos</option>
            <option value="MIXTO">Mixto</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="schedule">Horario</Label>
          <select
            id="schedule"
            name="schedule"
            defaultValue={defaults?.schedule ?? "NOCTURNO"}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="NOCTURNO">Nocturno</option>
            <option value="VESPERTINO">Vespertino</option>
            <option value="MATUTINO">Matutino</option>
            <option value="SABATINO">Sabatino</option>
            <option value="DOMINICAL">Dominical</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="maxTeams">Max equipos</Label>
          <Input id="maxTeams" name="maxTeams" type="number" required defaultValue={defaults?.maxTeams ?? 12} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inscriptionFee">Inscripcion $</Label>
          <Input id="inscriptionFee" name="inscriptionFee" type="number" required defaultValue={defaults?.inscriptionFee ?? 1200} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="refereeFee">Arbitraje $</Label>
          <Input id="refereeFee" name="refereeFee" type="number" required defaultValue={defaults?.refereeFee ?? 200} />
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fafafa]">
        <input
          id="refereeFeePerMatch"
          name="refereeFeePerMatch"
          type="checkbox"
          defaultChecked={defaults?.refereeFeePerMatch ?? true}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="refereeFeePerMatch" className="text-sm font-normal cursor-pointer">
          Arbitraje se paga <strong>por partido en efectivo</strong> el dia del juego
        </Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="startDate">Fecha de inicio</Label>
        <Input id="startDate" name="startDate" type="date" defaultValue={defaults?.startDate ?? ""} />
      </div>
    </div>
  );
}
