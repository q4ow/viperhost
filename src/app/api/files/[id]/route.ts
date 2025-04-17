import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import path from "path";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
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

    const fileId = params.id;

    const file = await db.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        user: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    const ext = path.extname(file.name);
    const fileDir = path.join(uploadsDir, file.userId);
    const filePath = path.join(fileDir, file.fileId + ext);
    console.log(`Absolute file path: ${filePath}`);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`File deleted from filesystem: ${filePath}`);
        const filesLeft = fs.readdirSync(fileDir);
        if (filesLeft.length === 0) {
          fs.rmdirSync(fileDir);
          logger.info(`Directory deleted: ${fileDir}`);
        }
      } else {
        logger.warn(`File not found on filesystem: ${filePath}`);
      }
    } catch (fsError) {
      logger.error("Error deleting file from filesystem", {
        error: fsError,
        filePath,
      });
    }

    await db.file.delete({
      where: {
        id: fileId,
      },
    });

    logger.info(`File record deleted from database: ${fileId}`, {
      userId: session.user.id,
      fileUrl: file.rawUrl,
    });

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("File deletion error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
