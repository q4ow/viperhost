import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { ExtendedSession } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = (await getServerSession(
      authOptions,
    )) as ExtendedSession | null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username } = await req.json();

    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          name: username,
          NOT: {
            id: session.user.id,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 },
        );
      }
    }

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name || undefined,
      },
    });

    logger.info(`Profile updated for user: ${session.user.id}`);

    return NextResponse.json(
      {
        name: updatedUser.name,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Profile update error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
