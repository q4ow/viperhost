import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { admin: true },
  });

  const files = await db.file.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const subscription = await db.subscription.findFirst({
    where: { userId: session.user.id, status: "active" },
  });

  return NextResponse.json({
    files,
    isPro: !!subscription || !!user?.admin,
  });
}
