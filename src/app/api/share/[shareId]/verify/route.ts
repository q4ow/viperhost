import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { logger } from "@/lib/logger";

interface Params {
  params: {
    shareId: string;
  };
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { shareId } = params;
    const { password } = await req.json();

    const shareLink = await db.shareLink.findUnique({
      where: {
        shareId,
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 },
      );
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 },
      );
    }

    if (!shareLink.password) {
      return NextResponse.json(
        { error: "Share link is not password protected" },
        { status: 400 },
      );
    }

    const isPasswordValid = await compare(password, shareLink.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = sign({ shareId }, process.env.NEXTAUTH_SECRET || "secret", {
      expiresIn: "1h",
    });

    logger.info(`Password verified for shared file: ${shareId}`);

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    logger.error("Share link password verification error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
