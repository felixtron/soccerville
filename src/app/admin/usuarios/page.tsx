import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, MapPin, Mail, Phone } from "lucide-react";
import { CreateUserButton, EditUserButton, ResetPasswordButton } from "@/components/admin/user-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteUser } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, { label: string; class: string }> = {
  ADMIN: { label: "Admin", class: "bg-red-100 text-red-700" },
  OPERATOR: { label: "Operador", class: "bg-blue-100 text-blue-700" },
  CAPTAIN: { label: "Capitan", class: "bg-emerald-100 text-emerald-700" },
};

export default async function UsuariosAdmin() {
  const [users, venues] = await Promise.all([
    prisma.user.findMany({
      include: { venue: true },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
  ]);

  const admins = users.filter((u) => u.role === "ADMIN");
  const operators = users.filter((u) => u.role === "OPERATOR");
  const captains = users.filter((u) => u.role === "CAPTAIN");

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Usuarios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {admins.length} admin &middot; {operators.length} operadores &middot;{" "}
            {captains.length} capitanes
          </p>
        </div>
        <CreateUserButton venues={venues} />
      </div>

      {users.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <UserCog className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay usuarios registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const role = roleLabels[user.role] ?? roleLabels.CAPTAIN;
            const userData = {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              venueId: user.venueId,
            };
            return (
              <Card key={user.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.name}</p>
                        <Badge className={role.class + " text-xs"}>
                          {role.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                        {user.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.venue.name.replace("Soccerville ", "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground whitespace-nowrap mr-2">
                      {new Date(user.createdAt).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <EditUserButton venues={venues} user={userData} />
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
    </>
  );
}
