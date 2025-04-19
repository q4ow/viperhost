import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    logger.error("Webhook signature verification failed", { error });
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          throw new Error("User ID is required");
        }

        // Retrieve the subscription details to get the current period end
        const subscriptionId = session.subscription as string;
        const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);

        await db.subscription.upsert({
          where: {
            userId,
          },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: process.env.STRIPE_PRICE_ID as string,
            status: "active",
            currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: process.env.STRIPE_PRICE_ID as string,
            status: "active",
            currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
          },
        });

        logger.info(`Subscription created for user: ${userId}`, {
          subscriptionId,
          currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.lines.data[0]?.subscription as string;

        if (!subscriptionId) {
          logger.warn("No subscription ID found in invoice", {
            invoiceId: invoice.id,
          });
          break;
        }

        const subscription = await db.subscription.findFirst({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
        });

        if (subscription) {
          await db.subscription.update({
            where: {
              id: subscription.id,
            },
            data: {
              status: "active",
              currentPeriodEnd: new Date(invoice.period_end * 1000),
            },
          });

          logger.info(`Subscription renewed: ${subscriptionId}`, {
            userId: subscription.userId,
            currentPeriodEnd: new Date(invoice.period_end * 1000),
          });
        } else {
          logger.warn(`Subscription not found for invoice: ${invoice.id}`, {
            subscriptionId
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id as string;

        // Log more details about the deleted subscription
        logger.info(`Processing subscription deletion`, {
          subscriptionId,
          status: subscription.status,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        });

        await db.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            status: "canceled",
            canceledAt: new Date(),
            // Make sure currentPeriodEnd is set to now, to immediately end Pro access
            currentPeriodEnd: new Date(),
          },
        });

        logger.info(`Subscription fully deleted: ${subscriptionId}`);
        break;
      }

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook handler error", { error, eventType: event.type });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
