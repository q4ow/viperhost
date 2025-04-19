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

    // Get the subscription details from Stripe to find the current period end
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Cancel at period end to maintain access until billing cycle completes
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database with current period end
    await db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "active", // Keep as active until period ends
        canceledAt: new Date(),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });

    logger.info(`Subscription canceled for user: ${userId}`, {
      subscriptionId: subscription.stripeSubscriptionId,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });

    return NextResponse.json(
      {
        message: "Subscription canceled successfully. You'll maintain access until the end of your billing period."
      },
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
