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
import { UserPlus, Trash2, Play, Pause } from "lucide-react";
import { enrollStudent, updateEnrollmentStatus, removeEnrollment } from "@/app/admin/actions";
import { PasswordInput } from "@/components/shared/password-input";

export function EnrollStudentButton({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" />}>
        <UserPlus className="h-4 w-4 mr-2" />
        Inscribir Alumno
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inscribir a {programName}</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            startTransition(async () => {
              await enrollStudent(formData);
              setOpen(false);
            });
          }}
        >
          <input type="hidden" name="programId" value={programId} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nombre del alumno</Label>
                <Input name="studentName" required placeholder="Juan Perez" />
              </div>
              <div className="grid gap-2">
                <Label>Edad</Label>
                <Input name="studentAge" type="number" min="3" max="99" placeholder="10" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#fafafa] space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Padre / Tutor
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input name="parentName" placeholder="Nombre del padre" />
                </div>
                <div className="grid gap-2">
                  <Label>Telefono</Label>
                  <Input name="parentPhone" placeholder="722 123 4567" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#fafafa] space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cuenta de acceso
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" required placeholder="padre@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Telefono</Label>
                  <Input name="phone" placeholder="722 123 4567" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Contrasena (default: escuela123)</Label>
                <PasswordInput name="password" defaultValue="escuela123" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Inscribiendo..." : "Inscribir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EnrollmentActions({
  enrollmentId,
  currentStatus,
}: {
  enrollmentId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-center gap-1">
      {currentStatus === "ACTIVE" ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-amber-600"
          title="Suspender"
          disabled={pending}
          onClick={() => startTransition(() => updateEnrollmentStatus(enrollmentId, "SUSPENDED"))}
        >
          <Pause className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-emerald-600"
          title="Reactivar"
          disabled={pending}
          onClick={() => startTransition(() => updateEnrollmentStatus(enrollmentId, "ACTIVE"))}
        >
          <Play className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-red-600"
        title="Eliminar"
        disabled={pending}
        onClick={() => {
          if (confirm("Eliminar inscripcion?")) {
            startTransition(() => removeEnrollment(enrollmentId));
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
