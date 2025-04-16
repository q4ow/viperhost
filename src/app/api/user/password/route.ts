import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash, compare } from "bcrypt";
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

    const { currentPassword, newPassword } = await req.json();

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    logger.info(`Password changed for user: ${user.id}`);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Password change error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
