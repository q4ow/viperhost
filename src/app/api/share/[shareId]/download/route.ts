import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

interface Params {
  params: {
    shareId: string;
  };
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { shareId } = params;

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

    await db.shareLink.update({
      where: {
        id: shareLink.id,
      },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    logger.info(`Shared file downloaded: ${shareLink.fileId}`, {
      shareId,
      fileId: shareLink.fileId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Share link download error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
