import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Verify this user is a captain with a team
  const team = await prisma.team.findUnique({
    where: { captainId: userId },
    select: { id: true },
  });
  if (!team) {
    return NextResponse.json({ error: "No team found" }, { status: 403 });
  }

  const { tournamentId, teamId } = await req.json();

  // Verify the team belongs to this captain
  if (team.id !== teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Check tournament is open and not full
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { teams: true } } },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  }
  if (tournament.status !== "OPEN") {
    return NextResponse.json({ error: "El torneo no acepta inscripciones" }, { status: 400 });
  }
  if (tournament._count.teams >= tournament.maxTeams) {
    return NextResponse.json({ error: "El torneo esta lleno" }, { status: 400 });
  }

  // Atomic enrollment with duplicate + capacity check
  try {
    await prisma.$transaction(async (tx) => {
      // Check not already enrolled (inside transaction)
      const existing = await tx.tournamentTeam.findFirst({
        where: { tournamentId, teamId },
      });
      if (existing) throw new Error("ALREADY_ENROLLED");

      // Re-check capacity inside transaction
      const currentCount = await tx.tournamentTeam.count({
        where: { tournamentId },
      });
      if (currentCount >= tournament.maxTeams) throw new Error("TOURNAMENT_FULL");

      await tx.tournamentTeam.create({
        data: { tournamentId, teamId },
      });

      // Auto-set FULL if needed
      if (currentCount + 1 >= tournament.maxTeams) {
        await tx.tournament.update({
          where: { id: tournamentId },
          data: { status: "FULL" },
        });
      }
    });
  } catch (e: any) {
    if (e.message === "ALREADY_ENROLLED") {
      return NextResponse.json({ error: "Ya estas inscrito en este torneo" }, { status: 400 });
    }
    if (e.message === "TOURNAMENT_FULL") {
      return NextResponse.json({ error: "El torneo esta lleno" }, { status: 400 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
