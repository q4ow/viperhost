import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      !("id" in session.user) ||
      !session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        files: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", user.uuid);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    await db.user.delete({
      where: {
        id: user.id,
      },
    });

    logger.info(`Account deleted: ${user.id}`);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Account deletion error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
