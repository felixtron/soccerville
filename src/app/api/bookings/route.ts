import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bookings?venueId=xxx&date=2026-04-10
// Returns booked time slots for a given venue and date
export async function GET(req: NextRequest) {
  const venueId = req.nextUrl.searchParams.get("venueId");
  const dateStr = req.nextUrl.searchParams.get("date");

  if (!venueId || !dateStr) {
    return NextResponse.json({ error: "Missing venueId or date" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00");
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      venueId,
      date: { gte: date, lt: nextDay },
      status: { not: "CANCELLED" },
    },
    select: { startTime: true, endTime: true, status: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ bookings });
}

// POST /api/bookings — Create a new booking (public)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { venueId, date, startTime, endTime, customerName, customerPhone, customerEmail } = body;

  if (!venueId || !date || !startTime || !endTime || !customerName || !customerPhone) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Check if slot is available
  const bookingDate = new Date(date + "T00:00:00");
  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const conflict = await prisma.booking.findFirst({
    where: {
      venueId,
      date: { gte: bookingDate, lt: nextDay },
      status: { not: "CANCELLED" },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "Este horario ya esta reservado" }, { status: 409 });
  }

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { fieldRentalPrice: true, stripeOnboarded: true },
  });

  const booking = await prisma.booking.create({
    data: {
      venueId,
      date: bookingDate,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  return NextResponse.json({
    booking: { id: booking.id },
    price: venue?.fieldRentalPrice ?? 550,
    stripeEnabled: venue?.stripeOnboarded ?? false,
  });
}
