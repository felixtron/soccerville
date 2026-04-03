import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/stripe/connect — Create Express account & return onboarding URL
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { venueId } = await req.json();

  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Create or retrieve Stripe Express account
  let accountId = venue.stripeAccountId;

  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      country: "MX",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: venue.name,
        url: `https://soccerville.prosuite.pro/torneos/${venue.slug}`,
      },
      metadata: { venueId: venue.id },
    });
    accountId = account.id;

    await prisma.venue.update({
      where: { id: venueId },
      data: { stripeAccountId: accountId },
    });
  }

  // Create onboarding link
  const origin = req.headers.get("origin") || "https://soccerville.prosuite.pro";
  const accountLink = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/admin/stripe?refresh=true`,
    return_url: `${origin}/admin/stripe?onboarded=true&venue=${venueId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET /api/stripe/connect?venueId=xxx — Check account status
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const venueId = req.nextUrl.searchParams.get("venueId");
  if (!venueId) {
    return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
  }

  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue?.stripeAccountId) {
    return NextResponse.json({ connected: false });
  }

  const account = await getStripe().accounts.retrieve(venue.stripeAccountId);
  const ready = account.charges_enabled && account.payouts_enabled;

  if (ready && !venue.stripeOnboarded) {
    await prisma.venue.update({
      where: { id: venueId },
      data: { stripeOnboarded: true },
    });
  }

  return NextResponse.json({
    connected: true,
    ready,
    accountId: venue.stripeAccountId,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}
