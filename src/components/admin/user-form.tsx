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
import { createUser, updateUser } from "@/app/admin/actions";

type Venue = { id: string; name: string };

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  venueId: string | null;
};

export function CreateUserButton({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Usuario
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Usuario</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createUser(formData);
              setOpen(false);
            });
          }}
        >
          <UserFields venues={venues} requirePassword />
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

export function EditUserButton({
  venues,
  user,
}: {
  venues: Venue[];
  user: UserData;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = updateUser.bind(null, user.id);

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
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await action(formData);
                setOpen(false);
              });
            }}
          >
            <UserFields venues={venues} defaults={user} />
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

function UserFields({
  venues,
  defaults,
  requirePassword,
}: {
  venues: Venue[];
  defaults?: Partial<UserData>;
  requirePassword?: boolean;
}) {
  const [role, setRole] = useState(defaults?.role ?? "OPERATOR");

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required defaultValue={defaults?.name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={defaults?.email} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">
            Contrasena{!requirePassword && " (dejar vacio para no cambiar)"}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required={requirePassword}
            minLength={6}
            placeholder={requirePassword ? "" : "Sin cambios"}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="role">Rol</Label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="ADMIN">Admin</option>
            <option value="OPERATOR">Operador</option>
            <option value="CAPTAIN">Capitan</option>
          </select>
        </div>
        {role === "OPERATOR" && (
          <div className="grid gap-2">
            <Label htmlFor="venueId">Sede asignada</Label>
            <select
              id="venueId"
              name="venueId"
              defaultValue={defaults?.venueId ?? ""}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Sin sede</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name.replace("Soccerville ", "")}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
