import { NextRequest, NextResponse } from "next/server";
import { getStripe, calculateApplicationFee } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/stripe/checkout — Create Checkout Session with Connect destination charge
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, venueId, amount, description, metadata } = body;

  // Validate venue has Stripe connected
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue?.stripeAccountId || !venue.stripeOnboarded) {
    return NextResponse.json(
      { error: "Esta sede no tiene pagos en linea habilitados" },
      { status: 400 }
    );
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
    success_url: `${origin}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pago/cancelado`,
    metadata: {
      venueId,
      type,
      ...metadata,
    },
  };

  // Add OXXO if available
  if (type === "BOOKING" || type === "INSCRIPTION") {
    sessionParams.payment_method_types.push("oxxo");
  }

  const session = await getStripe().checkout.sessions.create(sessionParams);

  // Create pending payment record
  await prisma.payment.create({
    data: {
      stripeSessionId: session.id,
      amount,
      applicationFee: Math.round(applicationFee / 100),
      currency: "mxn",
      status: "PENDING",
      type: type as any,
      venueId,
      tournamentId: metadata?.tournamentId || null,
      bookingId: metadata?.bookingId || null,
      spaceId: metadata?.spaceId || null,
      description,
    },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
