import { prisma } from "@/lib/prisma";
import { CreateUserButton } from "@/components/admin/user-form";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function UsuariosAdmin() {
  const [users, venues, tournaments] = await Promise.all([
    prisma.user.findMany({
      include: {
        venue: { select: { name: true } },
        team: {
          select: {
            id: true,
            name: true,
            tournaments: {
              select: {
                tournament: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
    prisma.tournament.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    venueId: u.venueId,
    venueName: u.venue?.name?.replace("Soccerville ", "") ?? null,
    teamId: u.team?.id ?? null,
    teamName: u.team?.name ?? null,
    tournamentIds: u.team?.tournaments.map((t) => t.tournament.id) ?? [],
    tournamentNames: u.team?.tournaments.map((t) => t.tournament.name) ?? [],
    createdAt: u.createdAt.toISOString(),
  }));

  const admins = serialized.filter((u) => u.role === "ADMIN").length;
  const operators = serialized.filter((u) => u.role === "OPERATOR").length;
  const captains = serialized.filter((u) => u.role === "CAPTAIN").length;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">
            Usuarios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {admins} admin &middot; {operators} operadores &middot; {captains} capitanes
          </p>
        </div>
        <CreateUserButton venues={venues} />
      </div>

      <UsersTable
        users={serialized}
        venues={venues}
        tournaments={tournaments}
      />
    </>
  );
}
