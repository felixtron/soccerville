"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { generateRoundRobin, calculateStandings, type StandingCalc } from "@/lib/fixtures";

// ─── Helpers ────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Tournaments ────────────────────────────────────────────

export async function createTournament(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  await prisma.tournament.create({
    data: {
      name,
      slug: slugify(name) + "-" + Date.now().toString(36),
      venueId: formData.get("venueId") as string,
      category: formData.get("category") as any,
      schedule: formData.get("schedule") as any,
      maxTeams: parseInt(formData.get("maxTeams") as string),
      inscriptionFee: parseInt(formData.get("inscriptionFee") as string),
      refereeFee: parseInt(formData.get("refereeFee") as string),
      status: (formData.get("status") as any) || "OPEN",
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : null,
    },
  });

  revalidatePath("/admin/torneos");
  revalidatePath("/admin/dashboard");
}

export async function updateTournament(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.tournament.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      venueId: formData.get("venueId") as string,
      category: formData.get("category") as any,
      schedule: formData.get("schedule") as any,
      maxTeams: parseInt(formData.get("maxTeams") as string),
      inscriptionFee: parseInt(formData.get("inscriptionFee") as string),
      refereeFee: parseInt(formData.get("refereeFee") as string),
      status: formData.get("status") as any,
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : null,
    },
  });

  revalidatePath("/admin/torneos");
  revalidatePath("/admin/dashboard");
}

export async function deleteTournament(id: string) {
  await requireAdmin();
  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/admin/torneos");
  revalidatePath("/admin/dashboard");
}

// ─── Bookings ───────────────────────────────────────────────

export async function createBooking(formData: FormData) {
  await requireAdmin();

  await prisma.booking.create({
    data: {
      venueId: formData.get("venueId") as string,
      date: new Date(formData.get("date") as string),
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      customerEmail: (formData.get("customerEmail") as string) || null,
      status: (formData.get("status") as any) || "PENDING",
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
}

export async function updateBooking(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.booking.update({
    where: { id },
    data: {
      venueId: formData.get("venueId") as string,
      date: new Date(formData.get("date") as string),
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      customerName: formData.get("customerName") as string,
      customerPhone: formData.get("customerPhone") as string,
      customerEmail: (formData.get("customerEmail") as string) || null,
      status: formData.get("status") as any,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
}

export async function deleteBooking(id: string) {
  await requireAdmin();
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
}

// ─── Commercial Spaces ──────────────────────────────────────

export async function createSpace(formData: FormData) {
  await requireAdmin();

  await prisma.commercialSpace.create({
    data: {
      venueId: formData.get("venueId") as string,
      type: formData.get("type") as any,
      label: (formData.get("label") as string) || null,
      price: parseInt(formData.get("price") as string),
      contractMonths: parseInt(formData.get("contractMonths") as string) || 6,
      status: (formData.get("status") as any) || "AVAILABLE",
      tenantName: (formData.get("tenantName") as string) || null,
      tenantPhone: (formData.get("tenantPhone") as string) || null,
      tenantEmail: (formData.get("tenantEmail") as string) || null,
    },
  });

  revalidatePath("/admin/espacios");
  revalidatePath("/admin/dashboard");
}

export async function updateSpace(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.commercialSpace.update({
    where: { id },
    data: {
      venueId: formData.get("venueId") as string,
      type: formData.get("type") as any,
      label: (formData.get("label") as string) || null,
      price: parseInt(formData.get("price") as string),
      contractMonths: parseInt(formData.get("contractMonths") as string) || 6,
      status: formData.get("status") as any,
      tenantName: (formData.get("tenantName") as string) || null,
      tenantPhone: (formData.get("tenantPhone") as string) || null,
      tenantEmail: (formData.get("tenantEmail") as string) || null,
    },
  });

  revalidatePath("/admin/espacios");
  revalidatePath("/admin/dashboard");
}

export async function deleteSpace(id: string) {
  await requireAdmin();
  await prisma.commercialSpace.delete({ where: { id } });
  revalidatePath("/admin/espacios");
  revalidatePath("/admin/dashboard");
}

// ─── Users ──────────────────────────────────────────────────

export async function createUser(formData: FormData) {
  await requireAdmin();

  const password = formData.get("password") as string;
  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      password: hashed,
      role: formData.get("role") as any,
      venueId: (formData.get("venueId") as string) || null,
    },
  });

  revalidatePath("/admin/usuarios");
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();

  const data: any = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || null,
    role: formData.get("role") as any,
    venueId: (formData.get("venueId") as string) || null,
  };

  const password = formData.get("password") as string;
  if (password) {
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}

// ─── Teams ──────────────────────────────────────────────────

export async function createTeam(formData: FormData) {
  await requireAdmin();

  const captainName = formData.get("captainName") as string;
  const captainEmail = formData.get("captainEmail") as string;
  const captainPhone = (formData.get("captainPhone") as string) || null;
  const password = (formData.get("captainPassword") as string) || "equipo123";
  const hashed = await bcrypt.hash(password, 12);

  const captain = await prisma.user.create({
    data: {
      name: captainName,
      email: captainEmail,
      phone: captainPhone,
      password: hashed,
      role: "CAPTAIN",
    },
  });

  await prisma.team.create({
    data: {
      name: formData.get("teamName") as string,
      captainId: captain.id,
    },
  });

  revalidatePath("/admin/equipos");
}

export async function deleteTeam(id: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { id }, select: { captainId: true } });
  await prisma.team.delete({ where: { id } });
  if (team) {
    await prisma.user.delete({ where: { id: team.captainId } }).catch(() => {});
  }
  revalidatePath("/admin/equipos");
}

// ─── Tournament Teams (enrollment) ─────────────────────────

export async function enrollTeam(tournamentId: string, teamId: string, groupName?: string) {
  await requireAdmin();

  await prisma.tournamentTeam.create({
    data: { tournamentId, teamId, groupName: groupName || null },
  });

  // Update team count, set to FULL if needed
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { _count: { select: { teams: true } } },
  });
  if (tournament && tournament._count.teams >= tournament.maxTeams) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "FULL" },
    });
  }

  revalidatePath(`/admin/torneos/${tournamentId}`);
}

export async function unenrollTeam(tournamentId: string, teamId: string) {
  await requireAdmin();

  await prisma.tournamentTeam.deleteMany({
    where: { tournamentId, teamId },
  });

  revalidatePath(`/admin/torneos/${tournamentId}`);
}

// ─── Fixtures ───────────────────────────────────────────────

export async function generateFixtures(tournamentId: string) {
  await requireAdmin();

  // Get enrolled teams with group info
  const enrolled = await prisma.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true, groupName: true },
  });

  if (enrolled.length < 2) {
    throw new Error("Se necesitan al menos 2 equipos para generar fixtures");
  }

  // Delete existing matches and standings
  await prisma.match.deleteMany({ where: { tournamentId } });
  await prisma.standing.deleteMany({ where: { tournamentId } });

  // Group teams by groupName (null = single group)
  const groups = new Map<string | null, string[]>();
  for (const e of enrolled) {
    const key = e.groupName;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e.teamId);
  }

  // Generate round-robin per group
  const allFixtures: { matchDay: number; homeTeamId: string; awayTeamId: string; groupName: string | null }[] = [];
  for (const [groupName, teamIds] of groups) {
    const fixtures = generateRoundRobin(teamIds);
    for (const f of fixtures) {
      allFixtures.push({ ...f, groupName });
    }
  }

  // Create matches
  await prisma.match.createMany({
    data: allFixtures.map((f) => ({
      tournamentId,
      matchDay: f.matchDay,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      groupName: f.groupName,
      status: "SCHEDULED" as const,
    })),
  });

  // Create initial standings per group
  await prisma.standing.createMany({
    data: enrolled.map((e) => ({
      tournamentId,
      teamId: e.teamId,
      groupName: e.groupName,
    })),
  });

  // Update tournament status
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "IN_PROGRESS" },
  });

  revalidatePath(`/admin/torneos/${tournamentId}`);
}

// ─── Match Results ──────────────────────────────────────────

export async function recordResult(matchId: string, formData: FormData) {
  await requireAdmin();

  const homeScore = parseInt(formData.get("homeScore") as string);
  const awayScore = parseInt(formData.get("awayScore") as string);

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "PLAYED" },
    select: { tournamentId: true },
  });

  // Recalculate all standings for this tournament
  await recalculateStandings(match.tournamentId);
  revalidatePath(`/admin/torneos/${match.tournamentId}`);
}

export async function clearResult(matchId: string) {
  await requireAdmin();

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: null, awayScore: null, status: "SCHEDULED" },
    select: { tournamentId: true },
  });

  await recalculateStandings(match.tournamentId);
  revalidatePath(`/admin/torneos/${match.tournamentId}`);
}

async function recalculateStandings(tournamentId: string) {
  const [enrolled, matches] = await Promise.all([
    prisma.tournamentTeam.findMany({
      where: { tournamentId },
      select: { teamId: true, groupName: true },
    }),
    prisma.match.findMany({
      where: { tournamentId },
    }),
  ]);

  const teamIds = enrolled.map((e) => e.teamId);
  const standings = calculateStandings(teamIds, matches);

  // Map teamId -> groupName for upserting
  const teamGroupMap = new Map(enrolled.map((e) => [e.teamId, e.groupName]));

  for (const s of standings) {
    await prisma.standing.upsert({
      where: { tournamentId_teamId: { tournamentId, teamId: s.teamId } },
      update: {
        points: s.points,
        gamesPlayed: s.gamesPlayed,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        penaltyPoints: s.penaltyPoints,
        defaultWins: s.defaultWins,
        defaultLosses: s.defaultLosses,
      },
      create: {
        tournamentId,
        teamId: s.teamId,
        groupName: teamGroupMap.get(s.teamId) || null,
        points: s.points,
        gamesPlayed: s.gamesPlayed,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        penaltyPoints: s.penaltyPoints,
        defaultWins: s.defaultWins,
        defaultLosses: s.defaultLosses,
      },
    });
  }
}

// ─── Match Events ──────────────────────────────────────────

export async function addMatchEvent(
  matchId: string,
  playerId: string,
  teamId: string,
  type: string,
  minute?: number,
  notes?: string
) {
  await requireAdmin();

  await prisma.matchEvent.create({
    data: {
      matchId,
      playerId,
      teamId,
      type: type as any,
      minute: minute ?? null,
      notes: notes ?? null,
    },
  });

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { tournamentId: true },
  });
  if (match) revalidatePath(`/admin/torneos/${match.tournamentId}`);
}

export async function removeMatchEvent(eventId: string) {
  await requireAdmin();

  const event = await prisma.matchEvent.findUnique({
    where: { id: eventId },
    include: { match: { select: { tournamentId: true } } },
  });

  await prisma.matchEvent.delete({ where: { id: eventId } });

  if (event) revalidatePath(`/admin/torneos/${event.match.tournamentId}`);
}

// ─── Match Schedule ────────────────────────────────────────

// ─── Notifications ─────────────────────────────────────────

export async function sendNotification(formData: FormData) {
  const session = await requireAdmin();

  const audience = formData.get("audience") as string;
  const data: any = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    audience,
    authorId: (session.user as any).id,
  };

  if (audience === "VENUE" && formData.get("venueId")) {
    data.venueId = formData.get("venueId") as string;
  }
  if (audience === "TOURNAMENT" && formData.get("tournamentId")) {
    data.tournamentId = formData.get("tournamentId") as string;
  }
  if (audience === "TEAM" && formData.get("teamId")) {
    data.teamId = formData.get("teamId") as string;
  }

  await prisma.notification.create({ data });
  revalidatePath("/admin/notificaciones");
}

export async function deleteNotification(id: string) {
  await requireAdmin();
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/admin/notificaciones");
}

export async function updateMatchSchedule(
  matchId: string,
  date: string | null,
  time: string | null,
  fieldNumber: number | null
) {
  await requireAdmin();

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      date: date ? new Date(date) : null,
      time,
      fieldNumber,
    },
    select: { tournamentId: true },
  });

  revalidatePath(`/admin/torneos/${match.tournamentId}`);
}

// ─── Payments ───────────────────────────────────────────────

export async function markPaymentCash(paymentId: string) {
  await requireAdmin();

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/admin/pagos");
  revalidatePath("/admin/dashboard");
}

export async function createManualPayment(formData: FormData) {
  await requireAdmin();

  await prisma.payment.create({
    data: {
      amount: parseInt(formData.get("amount") as string),
      type: formData.get("type") as any,
      venueId: formData.get("venueId") as string,
      status: "COMPLETED",
      description: (formData.get("description") as string) || null,
      tournamentId: (formData.get("tournamentId") as string) || null,
    },
  });

  revalidatePath("/admin/pagos");
  revalidatePath("/admin/dashboard");
}
