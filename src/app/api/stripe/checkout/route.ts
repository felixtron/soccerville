import { NextRequest, NextResponse } from "next/server";
import { getStripe, calculateApplicationFee } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/stripe/checkout — Create Checkout Session with Connect destination charge
export async function POST(req: NextRequest) {
  // Require authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { type, venueId, description, metadata } = body;

  if (!type || !venueId) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Validate venue has Stripe connected
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue?.stripeAccountId || !venue.stripeOnboarded) {
    return NextResponse.json(
      { error: "Esta sede no tiene pagos en linea habilitados" },
      { status: 400 }
    );
  }

  // Determine amount server-side based on type — never trust client amount
  let amount: number;

  if (type === "INSCRIPTION" && metadata?.tournamentId) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: metadata.tournamentId },
      select: { inscriptionFee: true },
    });
    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }
    amount = tournament.inscriptionFee;

    // Verify team is enrolled
    if (metadata?.teamId) {
      const enrollment = await prisma.tournamentTeam.findFirst({
        where: { tournamentId: metadata.tournamentId, teamId: metadata.teamId },
      });
      if (!enrollment) {
        return NextResponse.json(
          { error: "El equipo debe estar inscrito en el torneo para pagar" },
          { status: 400 }
        );
      }
    }
  } else if (type === "BOOKING" && metadata?.bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: metadata.bookingId },
      include: { venue: { select: { fieldRentalPrice: true } } },
    });
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    amount = booking.venue.fieldRentalPrice;
  } else {
    // Fallback for other types — require amount but validate it's positive
    amount = parseInt(body.amount);
    if (!amount || amount <= 0 || amount > 100000) {
      return NextResponse.json({ error: "Monto invalido" }, { status: 400 });
    }
  }

  // Amount in centavos (MXN)
  const amountCents = amount * 100;
  const applicationFee = calculateApplicationFee(amountCents);

  const origin = req.headers.get("origin") || "https://soccerville.prosuite.pro";

  const sessionParams: any = {
    mode: "payment",
    currency: "mxn",
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: description || "Pago Soccerville",
            description: `${venue.name}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: venue.stripeAccountId,
      },
    },
    payment_method_types: ["card"],
    success_url: type === "INSCRIPTION"
      ? `${origin}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}&redirect=/mi-equipo/inscribirse`
      : `${origin}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: type === "INSCRIPTION"
      ? `${origin}/mi-equipo/inscribirse`
      : `${origin}/pago/cancelado`,
    metadata: {
      venueId,
      type,
      ...metadata,
    },
  };

  // Add OXXO if available for these types
  if (type === "BOOKING" || type === "INSCRIPTION") {
    sessionParams.payment_method_types.push("oxxo");
  }

  const stripeSession = await getStripe().checkout.sessions.create(sessionParams);

  // Create pending payment record
  await prisma.payment.create({
    data: {
      stripeSessionId: stripeSession.id,
      amount,
      applicationFee: Math.round(applicationFee / 100),
      currency: "mxn",
      status: "PENDING",
      type: type as any,
      venueId,
      userId: (session.user as any).id,
      tournamentId: metadata?.tournamentId || null,
      bookingId: metadata?.bookingId || null,
      spaceId: metadata?.spaceId || null,
      description,
      metadata: metadata || null,
    },
  });

  return NextResponse.json({ url: stripeSession.url, sessionId: stripeSession.id });
}
