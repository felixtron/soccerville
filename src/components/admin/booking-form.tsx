"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBooking, updateBooking } from "@/app/admin/actions";

type Venue = { id: string; name: string };

type BookingData = {
  id: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  notes: string | null;
};

export function CreateBookingButton({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva Reserva
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Reserva</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createBooking(formData);
              setOpen(false);
            });
          }}
        >
          <BookingFields venues={venues} />
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

export function EditBookingButton({
  venues,
  booking,
}: {
  venues: Venue[];
  booking: BookingData;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = updateBooking.bind(null, booking.id);

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
            <DialogTitle>Editar Reserva</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await action(formData);
                setOpen(false);
              });
            }}
          >
            <BookingFields venues={venues} defaults={booking} />
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

function BookingFields({
  venues,
  defaults,
}: {
  venues: Venue[];
  defaults?: Partial<BookingData>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="customerName">Nombre</Label>
          <Input id="customerName" name="customerName" required defaultValue={defaults?.customerName} placeholder="Juan Perez" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerPhone">Telefono</Label>
          <Input id="customerPhone" name="customerPhone" required defaultValue={defaults?.customerPhone} placeholder="722 123 4567" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="customerEmail">Email (opcional)</Label>
        <Input id="customerEmail" name="customerEmail" type="email" defaultValue={defaults?.customerEmail ?? ""} />
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
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" name="date" type="date" required defaultValue={defaults?.date} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startTime">Inicio</Label>
          <Input id="startTime" name="startTime" type="time" required defaultValue={defaults?.startTime} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endTime">Fin</Label>
          <Input id="endTime" name="endTime" type="time" required defaultValue={defaults?.endTime} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "PENDING"}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={2} defaultValue={defaults?.notes ?? ""} placeholder="Notas adicionales..." />
      </div>
    </div>
  );
}
