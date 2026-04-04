import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      // OXXO payments complete asynchronously
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "FAILED" },
      });
      break;
    }

    case "account.updated": {
      // Connected account onboarding status changed
      const account = event.data.object;
      if (account.charges_enabled && account.payouts_enabled) {
        await prisma.venue.updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboarded: true },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: any) {
  const payment = await prisma.payment.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      stripePaymentId: session.payment_intent,
    },
  });

  // Type-specific fulfillment
  if (payment.type === "BOOKING" && payment.bookingId) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED", paymentStatus: "COMPLETED" },
    });
  }

  // Mark inscription as paid
  if (payment.type === "INSCRIPTION" && payment.tournamentId && payment.metadata) {
    const meta = payment.metadata as any;
    if (meta.teamId) {
      await prisma.tournamentTeam.updateMany({
        where: { tournamentId: payment.tournamentId, teamId: meta.teamId },
        data: { inscriptionPaid: true },
      });
    }
  }
}
