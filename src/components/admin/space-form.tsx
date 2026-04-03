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
import { createSpace, updateSpace } from "@/app/admin/actions";

type Venue = { id: string; name: string };

type SpaceData = {
  id: string;
  venueId: string;
  type: string;
  label: string | null;
  price: number;
  contractMonths: number;
  status: string;
  tenantName: string | null;
  tenantPhone: string | null;
  tenantEmail: string | null;
};

export function CreateSpaceButton({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Espacio
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Espacio Comercial</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createSpace(formData);
              setOpen(false);
            });
          }}
        >
          <SpaceFields venues={venues} />
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

export function EditSpaceButton({
  venues,
  space,
}: {
  venues: Venue[];
  space: SpaceData;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = updateSpace.bind(null, space.id);

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
            <DialogTitle>Editar Espacio Comercial</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await action(formData);
                setOpen(false);
              });
            }}
          >
            <SpaceFields venues={venues} defaults={space} />
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

function SpaceFields({
  venues,
  defaults,
}: {
  venues: Venue[];
  defaults?: Partial<SpaceData>;
}) {
  const [status, setStatus] = useState(defaults?.status ?? "AVAILABLE");

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            defaultValue={defaults?.type ?? "FOODTRUCK"}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="FOODTRUCK">Foodtruck</option>
            <option value="ADVERTISING">Publicidad</option>
            <option value="EVENT">Evento</option>
          </select>
        </div>
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
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label">Etiqueta</Label>
        <Input id="label" name="label" defaultValue={defaults?.label ?? ""} placeholder="Foodtruck #1" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Precio/mes $</Label>
          <Input id="price" name="price" type="number" required defaultValue={defaults?.price ?? 2500} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contractMonths">Meses</Label>
          <Input id="contractMonths" name="contractMonths" type="number" defaultValue={defaults?.contractMonths ?? 6} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="RENTED">Rentado</option>
          </select>
        </div>
      </div>
      {status === "RENTED" && (
        <div className="grid gap-4 p-3 rounded-lg bg-[#fafafa]">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inquilino</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tenantName">Nombre</Label>
              <Input id="tenantName" name="tenantName" defaultValue={defaults?.tenantName ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tenantPhone">Telefono</Label>
              <Input id="tenantPhone" name="tenantPhone" defaultValue={defaults?.tenantPhone ?? ""} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenantEmail">Email</Label>
            <Input id="tenantEmail" name="tenantEmail" type="email" defaultValue={defaults?.tenantEmail ?? ""} />
          </div>
        </div>
      )}
    </div>
  );
}
