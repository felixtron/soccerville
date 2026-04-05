import { NextRequest, NextResponse } from "next/server";
import { getStripe, calculateApplicationFee } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/stripe/subscription — Create recurring subscription for commercial space
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "OPERATOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { spaceId } = await req.json();

  const space = await prisma.commercialSpace.findUnique({
    where: { id: spaceId },
    include: { venue: { select: { id: true, name: true, stripeAccountId: true, stripeOnboarded: true } } },
  });

  if (!space) {
    return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 });
  }
  if (space.status !== "RENTED" || !space.tenantEmail) {
    return NextResponse.json({ error: "El espacio debe estar rentado con email del inquilino" }, { status: 400 });
  }
  if (!space.venue.stripeAccountId || !space.venue.stripeOnboarded) {
    return NextResponse.json({ error: "La sede no tiene Stripe habilitado" }, { status: 400 });
  }
  if (space.stripeSubscriptionId) {
    return NextResponse.json({ error: "Ya tiene una suscripcion activa" }, { status: 400 });
  }

  const stripe = getStripe();
  const amountCents = space.price * 100;
  const applicationFee = calculateApplicationFee(amountCents);

  // Create or find Stripe customer
  const customers = await stripe.customers.list({
    email: space.tenantEmail,
    limit: 1,
  });
  let customerId: string;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: space.tenantEmail,
      name: space.tenantName || undefined,
      phone: space.tenantPhone || undefined,
      metadata: { spaceId: space.id, venueId: space.venueId },
    });
    customerId = customer.id;
  }

  // Create recurring price on the connected account
  const product = await stripe.products.create({
    name: `${space.label || space.type} — ${space.venue.name}`,
    metadata: { spaceId: space.id },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "mxn",
    recurring: { interval: "month" },
  });

  // Create subscription checkout session with destination charge
  const origin = req.headers.get("origin") || "https://soccerville.prosuite.pro";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: {
      application_fee_percent: 5,
      transfer_data: {
        destination: space.venue.stripeAccountId!,
      },
    },
    success_url: `${origin}/admin/espacios?subscription=success&space=${space.id}`,
    cancel_url: `${origin}/admin/espacios`,
    metadata: { spaceId: space.id, type: "SPACE_SUBSCRIPTION" },
  });

  // Save price ID
  await prisma.commercialSpace.update({
    where: { id: space.id },
    data: { stripePriceId: price.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
