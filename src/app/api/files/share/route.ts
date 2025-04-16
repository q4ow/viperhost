import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { generateFileId } from "@/lib/utils";
import { hash } from "bcrypt";

export async function POST(req: Request) {
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

    const { fileId, password, expiryDate } = await req.json();

    const file = await db.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    const isPro = !!subscription;

    if ((password || expiryDate) && !isPro) {
      return NextResponse.json(
        { error: "Pro subscription required for these features" },
        { status: 403 },
      );
    }

    const shareId = await generateFileId();

    let hashedPassword = null;
    if (password) {
      hashedPassword = await hash(password, 10);
    }

    await db.shareLink.create({
      data: {
        shareId,
        fileId: file.id,
        userId: session.user.id,
        password: hashedPassword,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/${shareId}`;

    logger.info(`Share link created for file: ${file.id}`, {
      userId: session.user.id,
      shareId,
      hasPassword: !!password,
      expiresAt: expiryDate,
    });

    return NextResponse.json({ shareUrl }, { status: 201 });
  } catch (error) {
    logger.error("Share link creation error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
