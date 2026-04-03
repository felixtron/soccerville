"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

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
