import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
        OR: [
          { currentPeriodEnd: null },
          { currentPeriodEnd: { gt: new Date() } }
        ]
      },
    });

    logger.info(`User subscription status check`, {
      userId: session.user.id,
      hasSubscription: !!subscription,
      subscriptionStatus: subscription?.status,
      isAdmin: user?.admin,
      currentPeriodEnd: subscription?.currentPeriodEnd,
    });

    const files = await db.file.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const isPro = !!subscription || !!user?.admin;

    // Log the result of isPro calculation
    logger.info(`User Pro status determined`, {
      userId: session.user.id,
      isPro,
      filesCount: files.length,
    });

    return NextResponse.json({
      files,
      isPro,
    });
  } catch (error) {
    logger.error("Error fetching user files and subscription status", { error });
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
