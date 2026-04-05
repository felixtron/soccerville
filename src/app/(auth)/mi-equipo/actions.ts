"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireCaptainTeam() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const team = await prisma.team.findUnique({
    where: { captainId: userId },
    select: { id: true },
  });
  if (!team) throw new Error("No team found");
  return team.id;
}

// ─── Player CRUD ───────────────────────────────────────────

export async function addPlayer(formData: FormData) {
  const teamId = await requireCaptainTeam();

  await prisma.player.create({
    data: {
      teamId,
      name: formData.get("name") as string,
      number: formData.get("number") ? parseInt(formData.get("number") as string) : null,
      position: (formData.get("position") as string) || null,
    },
  });

  revalidatePath("/mi-equipo");
}

export async function updatePlayer(playerId: string, formData: FormData) {
  const teamId = await requireCaptainTeam();

  // Verify player belongs to this team
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { teamId: true },
  });
  if (!player || player.teamId !== teamId) throw new Error("Unauthorized");

  await prisma.player.update({
    where: { id: playerId },
    data: {
      name: formData.get("name") as string,
      number: formData.get("number") ? parseInt(formData.get("number") as string) : null,
      position: (formData.get("position") as string) || null,
    },
  });

  revalidatePath("/mi-equipo");
}

export async function removePlayer(playerId: string) {
  const teamId = await requireCaptainTeam();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { teamId: true },
  });
  if (!player || player.teamId !== teamId) throw new Error("Unauthorized");

  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath("/mi-equipo");
}

// ─── Notifications ─────────────────────────────────────────

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;

  await prisma.notificationRead.upsert({
    where: { notificationId_userId: { notificationId, userId } },
    update: {},
    create: { notificationId, userId },
  });

  revalidatePath("/mi-equipo");
}

// ─── Logo ──────────────────────────────────────────────────

export async function updateTeamLogo(logoUrl: string) {
  const teamId = await requireCaptainTeam();

  // Only allow internal upload URLs
  if (!logoUrl.startsWith("/api/uploads/logos/")) {
    throw new Error("Invalid logo URL");
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { logoUrl },
  });

  revalidatePath("/mi-equipo");
}
