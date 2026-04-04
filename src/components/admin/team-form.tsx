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
import { createTeam, updateTeamName } from "@/app/admin/actions";
import { PasswordInput } from "@/components/shared/password-input";

export function CreateTeamButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Equipo
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Equipo</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createTeam(formData);
              setOpen(false);
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="teamName">Nombre del equipo</Label>
              <Input id="teamName" name="teamName" required placeholder="Los Tiburones" />
            </div>
            <div className="p-3 rounded-lg bg-[#fafafa] space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Datos del Capitan
              </p>
              <div className="grid gap-2">
                <Label htmlFor="captainName">Nombre</Label>
                <Input id="captainName" name="captainName" required placeholder="Juan Perez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="captainEmail">Email</Label>
                  <Input id="captainEmail" name="captainEmail" type="email" required placeholder="juan@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="captainPhone">Telefono</Label>
                  <Input id="captainPhone" name="captainPhone" placeholder="722 123 4567" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="captainPassword">Contrasena (default: equipo123)</Label>
                <PasswordInput id="captainPassword" name="captainPassword" defaultValue="equipo123" />
              </div>
            </div>
          </div>
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

export function EditTeamButton({
  teamId,
  currentName,
}: {
  teamId: string;
  currentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = updateTeamName.bind(null, teamId);

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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await action(formData);
                setOpen(false);
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editName">Nombre del equipo</Label>
                <Input id="editName" name="name" required defaultValue={currentName} />
              </div>
            </div>
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
