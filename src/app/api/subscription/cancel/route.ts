import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !("id" in session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
      },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "canceled",
        canceledAt: new Date(),
      },
    });

    logger.info(`Subscription canceled for user: ${userId}`, {
      subscriptionId: subscription.stripeSubscriptionId,
    });

    return NextResponse.json(
      { message: "Subscription canceled successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Cancel subscription error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
