import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function createCheckoutSession(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?success=true`,
    cancel_url: `${baseUrl}/dashboard?canceled=true`,
    metadata: {
      userId,
    },
  });

  return checkoutSession;
}

export async function createBillingPortalSession(customerId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return portalSession;
}
