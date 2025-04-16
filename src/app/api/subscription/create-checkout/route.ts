import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const checkoutSession = await createCheckoutSession(userId);

    logger.info(`Checkout session created for user: ${userId}`, {
      sessionId: checkoutSession.id,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logger.error("Create checkout session error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
